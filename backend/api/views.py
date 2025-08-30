from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
import json, os, nltk, random, joblib
from django.conf import settings
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.stem import PorterStemmer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

nltk.download('stopwords')
nltk.download('punkt')

# Path to dataset folder
BASE_DIR = os.path.join(settings.BASE_DIR, "..", "data", "classification")

# Dictionary to hold samples
SAMPLES = {"business": [], "health": [], "politics": []}

# Load all text files into memory at startup
for category in SAMPLES.keys():
    folder = os.path.join(BASE_DIR, category)
    if os.path.exists(folder):
        for filename in os.listdir(folder):
            if filename.endswith(".txt"):
                filepath = os.path.join(folder, filename)
                with open(filepath, "r", encoding="utf-8") as f:
                    SAMPLES[category].append(f.read())
    else:
        print(f"Folder not found: {folder}")

class SampleTextView(APIView):
    def clean_sample(self, text):
        """Remove metadata lines and empty lines for readability"""
        lines = text.split("\n")
        lines = [line.strip() for line in lines if line.strip() and not line.startswith("#meta:")]
        return "\n\n".join(lines)

    def get(self, request, category):
        category = category.lower()
        if category not in SAMPLES:
            return Response({"error": "Invalid category"}, status=400)

        if not SAMPLES[category]:
            return Response({"error": "No samples available"}, status=404)

        raw_text = random.choice(SAMPLES[category])
        clean_text = self.clean_sample(raw_text)

        return Response({
            "category": category,
            "sample": clean_text
        })

class SearchScholarView(APIView):
    documents = None
    vectorizer = None
    tfidf_matrix = None
    preprocessed_docs = None

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.stemmer = PorterStemmer()
        self.stop_words = set(stopwords.words('english'))
        self.data_file = os.path.join(settings.BASE_DIR, "..", "crawler", "data", "publications.json")

        # Load documents & precompute TF-IDF once
        self.load_documents()
        if self.documents:
            self.preprocessed_docs = [
                " ".join(self.pre_process(doc.get("title", "") + " " + doc.get("abstract", "")))
                for doc in self.documents.values()
            ]
            self.vectorizer = TfidfVectorizer()
            self.tfidf_matrix = self.vectorizer.fit_transform(self.preprocessed_docs)

    def load_documents(self):
        if not self.documents:
            with open(self.data_file, "r", encoding="utf-8") as f:
                data = json.load(f)
            if isinstance(data, list):
                self.documents = {i: pub for i, pub in enumerate(data, 1)}
            else:
                self.documents = {1: data}
        return self.documents

    def pre_process(self, text):
        tokens = word_tokenize(text.lower())
        return [self.stemmer.stem(t) for t in tokens if t.isalnum() and t not in self.stop_words]

    def get(self, request):
        query = request.GET.get("query", "").strip()
        if not query:
            return Response({"error": "Query is required"}, status=400)

        page = int(request.GET.get("page", 1))
        page_size = 10

        query_vector = self.vectorizer.transform([" ".join(self.pre_process(query))])
        similarities = cosine_similarity(query_vector, self.tfidf_matrix).flatten()

        # Rank and paginate
        ranked_docs = sorted(zip(self.documents.keys(), similarities), key=lambda x: x[1], reverse=True)
        results = []
        for doc_id, score in ranked_docs:
            doc = self.documents[doc_id]
            authors = [{"name": a["name"], "profile": a.get("profile")} for a in doc.get("authors", [])]
            results.append({
                "title": doc.get("title"),
                "link": doc.get("link"),
                "authors": authors,
                "year": doc.get("published_date", ""),
                "snippet": doc.get("abstract", "")[:200] + "...",
                "score": float(score),
            })

        total_pages = (len(results) + page_size - 1) // page_size
        start = (page - 1) * page_size
        end = start + page_size
        paginated_results = results[start:end]

        return Response({
            "results": paginated_results,
            "page": page,
            "total_pages": total_pages
        }, status=status.HTTP_200_OK)

class TextClassifierView(APIView):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Load model and vectorizer once when server starts
        self.model = joblib.load(os.path.join(settings.BASE_DIR, "..", "classifier", "logreg_model.pkl"))
        self.vectorizer = joblib.load(os.path.join(settings.BASE_DIR, "..","classifier", "tfidf_vectorizer.pkl"))
    
    def post(self, request):
        try:
            text = request.data.get("text", "")
            if not text:
                return Response({"error": "No text provided"}, status=status.HTTP_400_BAD_REQUEST)

            # Transform and predict
            X = self.vectorizer.transform([text])
            prediction = self.model.predict(X)[0]
            probabilities = self.model.predict_proba(X)[0]

            return Response({
                "text": text,
                "prediction": prediction,
                "probabilities": {cls: float(prob) for cls, prob in zip(self.model.classes_, probabilities)}
            })
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
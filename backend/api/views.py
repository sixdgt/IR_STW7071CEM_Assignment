from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
import json, os, nltk
from django.conf import settings
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.stem import PorterStemmer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

nltk.download('stopwords')
nltk.download('punkt')

class SearchScholarView(APIView):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.stemmer = PorterStemmer()
        self.stop_words = set(stopwords.words('english'))
        self.data_file = os.path.join(
            settings.BASE_DIR, "..", "crawler", "data", "publications.json"
        )

    def load_documents(self):
        with open(self.data_file, "r", encoding="utf-8") as f:
            data = json.load(f)
        if isinstance(data, list):
            return {i: pub for i, pub in enumerate(data, 1)}
        return {1: data}

    def pre_process(self, text):
        tokens = word_tokenize(text.lower())
        return [self.stemmer.stem(t) for t in tokens if t.isalnum() and t not in self.stop_words]

    def get(self, request):
        query = request.GET.get("query", "").strip()
        if not query:
            return Response({"error": "Query is required"}, status=400)

        documents = self.load_documents()
        page = int(request.GET.get("page", 1))
        page_size = 10

        # Build corpus and vectorize
        corpus = [
            " ".join(self.pre_process(doc.get("title", "") + " " + doc.get("abstract", "")))
            for doc in documents.values()
        ]
        vectorizer = TfidfVectorizer()
        tfidf_matrix = vectorizer.fit_transform(corpus)

        # Process query and compute similarity
        query_vector = vectorizer.transform([" ".join(self.pre_process(query))])
        similarities = cosine_similarity(query_vector, tfidf_matrix).flatten()

        # Rank documents
        ranked_docs = sorted(zip(documents.keys(), similarities), key=lambda x: x[1], reverse=True)

        # Format results
        results = []
        for doc_id, score in ranked_docs:
            doc = documents[doc_id]
            authors = [{"name": a["name"], "profile": a.get("profile")} for a in doc.get("authors", [])]
            results.append({
                "title": doc.get("title"),
                "link": doc.get("link"),
                "authors": authors,
                "year": doc.get("published_date", ""),
                "snippet": doc.get("abstract", "")[:200] + "...",
                "score": float(score),
            })

        # Pagination
        total_pages = (len(results) + page_size - 1) // page_size
        start = (page - 1) * page_size
        end = start + page_size
        paginated_results = results[start:end]

        return Response({
            "results": paginated_results,
            "page": page,
            "total_pages": total_pages
        }, status=status.HTTP_200_OK)

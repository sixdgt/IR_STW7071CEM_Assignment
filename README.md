# Coventry University FBL Publications Search Engine

This project implements a **vertical search engine** comparable to Google Scholar, specialized in retrieving **papers and books published by members of Coventry University's School of Economics, Finance and Accounting**.  

It crawls the relevant web pages from [PurePortal of Coventry University], extracts publication information, and allows users to search publications by keywords with results ranked by relevance.

---

## Features

- **Crawling & Scraping**  
  - Crawls the PurePortal FBL website while respecting `robots.txt` rules.  
  - Extracts publication data, including:
    - Title  
    - Authors  
    - Publication year  
    - Links to the publication page  
    - Links to the author profile (PurePortal profile)  
  - Can be scheduled to run automatically (e.g., weekly) to update the index.

- **Search Interface**  
  - Simple Python-based interface for users to enter keywords.  
  - Pre-processing of both crawled data and user queries, including:
    - Tokenization  
    - Stopword removal  
    - Stemming  
  - Results are displayed in order of relevance (similar to Google Scholar).  
  - Clickable links in the console output for direct access to publications and author profiles.

- **Polite Crawling**  
  - Adheres to crawling etiquette to avoid overloading the server.  
  - Configurable crawl delays between requests.

---

## Installation

1. **Clone the repository**  

```
git clone https://github.com/sixdgt/IR_STW7071CEM_Assignment.git
cd IR_STW7071CEM_Assignment
```
2. **Create and activate a virtual environment (recommended)
```
python -m venv venv
# On Windows
venv\Scripts\activate
# On Linux / macOS
source venv/bin/activate
```
3. **Install required packages
```
pip install -r requirements.txt
```
## Required Packages
The project uses the following Python packages:
Package	Purpose
- requests:	HTTP requests for web crawling
- beautifulsoup4:	Parsing HTML content
- lxml:	HTML parser
- nltk:	Natural Language Processing (tokenization, stopwords, stemming)
- scikit-learn:	TF-IDF vectorization and cosine similarity for search ranking
- pandas:	Data storage and manipulation
- schedule:	Scheduling automated crawling
- tqdm:	Progress bars for crawling
- react axios:  fetching apis
- tailwindcss:  css utility framework

## Notes
- Make sure your internet connection is active when running the crawler.
- The search engine is limited to publications authored by members of the FBL department.
- Results are ranked based on TF-IDF cosine similarity between user queries and publication data.
- The crawler can be scheduled using the schedule library to update the index automatically.

## License
This project is licensed under the MIT License.

# Follow me on:
- **Facebook:** [CodeSandes](https://www.facebook.com/codesandes)
- **Instagram:** [@codesandes](https://www.instagram.com/codesandes/)
- **LinkedIn:** [tmgsandesh](https://www.linkedin.com/in/tmgsandesh/)
- **YouTube:** [CodeSandesh](https://www.youtube.com/@codesandesh)
- **TikTok:** [@codesandesh](https://www.tiktok.com/codesandesh/)



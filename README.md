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

```bash
git clone https://github.com/sixdgt/IR_STW7071CEM_Assignment.git
cd IR_STW7071CEM_Assignment

# Create and activate a virtual environment (recommended)
python -m venv venv
# On Windows
venv\Scripts\activate
# On Linux / macOS
source venv/bin/activate

# Install required packages
pip install -r requirements.txt


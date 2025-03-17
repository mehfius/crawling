# Dental Cremer Web Scraper

This project is a web scraper for extracting product data from the Dental Cremer e-commerce website.

## Features
- Scrapes product data including SKU, name, price, description, image, and URL
- Organizes data into JSON files by category and page
- Handles pagination automatically
- Saves data in a structured directory format

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/dental-cremer-scraper.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

## Usage
Run the scraper:
```bash
node src/index.js
```

The scraped data will be saved in the `data/products` directory, organized by category.

## Requirements
- Node.js
- Puppeteer

## License
MIT 
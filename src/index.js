const puppeteer = require('puppeteer')
const fs = require('fs')
const path = require('path')

async function scrape_website() {
    const urls = [
        'https://www.dentalcremer.com.br/descartaveis.html',
        'https://www.dentalcremer.com.br/biosseguranca.html',
        'https://www.dentalcremer.com.br/dentistica-e-estetica.html',
        'https://www.dentalcremer.com.br/ortodontia.html',
        'https://www.dentalcremer.com.br/endodontia.html',
        'https://www.dentalcremer.com.br/implantodontia.html',
        'https://www.dentalcremer.com.br/harmonizacao-orofacial.html',
        'https://www.dentalcremer.com.br/protese-clinica.html',
        'https://www.dentalcremer.com.br/protese-laboratorial.html',
        'https://www.dentalcremer.com.br/radiologia.html',
        'https://www.dentalcremer.com.br/cirurgia-e-periodontia.html',
        'https://www.dentalcremer.com.br/cadeiras-odontologicas.html',
        'https://www.dentalcremer.com.br/anestesicos-e-agulha-gengival.html',
        'https://www.dentalcremer.com.br/moldagem-e-modelo.html',
        'https://www.dentalcremer.com.br/equipamentos.html',
        'https://www.dentalcremer.com.br/instrumentais.html',
        'https://www.dentalcremer.com.br/higiene-oral.html',
        'https://www.dentalcremer.com.br/prevencao-e-profilaxia.html',
        'https://www.dentalcremer.com.br/moda-odonto',
        'https://www.dentalcremer.com.br/para-o-consultorio.html'
    ]
    
    for (const url of urls) {
        const url_obj = new URL(url)
        const html_name = url_obj.pathname.split('/').pop().replace('.html', '')
        const output_dir = path.join(__dirname, 'data', 'products', html_name)
        
        ensure_directory_exists(output_dir)
        
        const browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--window-size=1280,800',
                '--window-position=0,0'
            ]
        })
        
        const page = await browser.newPage()
        let current_page = 1
        
        while (true) {
            const page_url = `${url}?page=${current_page}&resultsperpage=96&sortby=relevance`
            console.log(`Scraping page ${current_page} of ${html_name}...`)
            
            await page.goto(page_url, {
                waitUntil: 'networkidle0'
            })
            
            try {
                await page.waitForSelector('li.product-item', { timeout: 5000 })
                
                const products = await page.evaluate(() => {
                    const items = document.querySelectorAll('li.product-item')
                    if (items.length === 0) return null
                    
                    return Array.from(items).map(item => {
                        const name = item.querySelector('.product-item-name span')?.textContent?.trim()
                        const price_element = item.querySelector('.price')
                        const price = price_element?.textContent?.trim() || 
                                     price_element?.closest('.price-wrapper')?.getAttribute('data-price-amount') ||
                                     item.querySelector('.normal-price .price')?.textContent?.trim()
                        const description = item.querySelector('.product-item-description span')?.textContent?.trim()
                        const image = item.querySelector('.product-image-photo')?.getAttribute('src')
                        const url = item.querySelector('.product-item-link')?.getAttribute('href')
                        const sku = item.querySelector('.product-image-container')?.getAttribute('data-sku')
                        
                        return {
                            sku,
                            name,
                            price,
                            description,
                            image,
                            url
                        }
                    })
                })
                
                if (!products || products.length === 0) {
                    console.log('No more products found. Stopping...')
                    break
                }
                
                const filename = path.join(output_dir, `page_${String(current_page).padStart(2, '0')}.json`)
                await save_to_file(filename, products)
                current_page++
                
            } catch (error) {
                console.log('No more pages available. Stopping...')
                break
            }
        }
        
        await browser.close()
    }
}

function ensure_directory_exists(directory_path) {
    if (!fs.existsSync(directory_path)) {
        fs.mkdirSync(directory_path, { recursive: true })
        console.log('Created directory:', directory_path)
    }
}

async function save_to_file(filename, content) {
    try {
        fs.writeFileSync(
            filename,
            JSON.stringify(content, null, 2),
            { encoding: 'utf8' }
        )
        console.log('Products saved to:', filename)
    } catch (error) {
        console.error('Error saving file:', error)
    }
}

scrape_website()
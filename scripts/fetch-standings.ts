import puppeteer, { Browser, Page, Frame } from 'puppeteer';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Constants
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DOWNLOAD_PATH = resolve(__dirname, '../src/data');
const EXCEL_URL = 'https://1drv.ms/x/c/61a1a0e60d129414/EXDxnLi_l6JOhclOrGfIQEkBqPsF964zhwJECcS5W3-wRQ?e=tJjbsM';
const OUTPUT_FILENAME = 'standings.xlsx';

// Configuration
const BROWSER_CONFIG = {
  headless: true,
  args: [
    '--disable-web-security',
    '--disable-features=IsolateOrigins,site-per-process',
    '--no-sandbox'
  ]
};

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36';

interface MenuSelectors {
  fileMenu: string;
  createCopy: string;
  downloadCopy: string;
}

const SELECTORS: MenuSelectors = {
  fileMenu: '#FileMenuFlyoutLauncher',
  createCopy: 'div[name="Create a Copy"]',
  downloadCopy: 'div[name="Download a Copy"]'
};

async function setupBrowserAndPage(): Promise<{ browser: Browser; page: Page }> {
  const browser = await puppeteer.launch(BROWSER_CONFIG);
  const page = await browser.newPage();

  await page.setUserAgent(USER_AGENT);

  // Configure download behavior
  const client = await page.target().createCDPSession();
  await client.send('Page.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath: DOWNLOAD_PATH,
  });

  return { browser, page };
}

async function getFrame(page: Page): Promise<Frame> {
  await page.waitForSelector('#WacFrame_Excel_0');
  console.log('Excel iframe found');

  const frameHandle = await page.$('#WacFrame_Excel_0');
  const frame = await frameHandle?.contentFrame();

  if (!frame) {
    throw new Error('Could not get iframe content');
  }

  return frame;
}

async function clickMenuItem(frame: Frame, selector: string, name: string, timeout = 5000) {
  const button = await frame.waitForSelector(selector, {
    timeout,
    visible: true
  });

  if (!button) {
    throw new Error(`${name} not found in iframe`);
  }

  console.log(`Clicking ${name}`);
  await button.click();
}

async function handleFileDownload(downloadPath: string, outputPath: string) {
  await new Promise((resolve) => setTimeout(resolve, 5000));

  const files = fs.readdirSync(downloadPath);
  const downloadedFile = files.find(file => file.endsWith('.xlsx'));

  if (downloadedFile) {
    const oldPath = resolve(downloadPath, downloadedFile);
    const newPath = resolve(downloadPath, outputPath);

    if (fs.existsSync(newPath)) {
      fs.unlinkSync(newPath);
    }

    fs.renameSync(oldPath, newPath);
    console.log(`File downloaded and saved to ${newPath}`);
  }
}

async function saveDebugInfo(page: Page) {
  const html = await page.content();
  fs.writeFileSync('debug.html', html);

  const elementHandle = await page.$('#WacFrame_Excel_0');
  const frame = await elementHandle?.contentFrame();
  if (frame) {
    const frameHtml = await frame.content();
    fs.writeFileSync('iframe-debug.html', frameHtml);
  }
}

async function downloadExcelFile(url: string, outputPath: string) {
  // Create downloads directory if it doesn't exist
  if (!fs.existsSync(DOWNLOAD_PATH)) {
    fs.mkdirSync(DOWNLOAD_PATH, { recursive: true });
  }

  let browser: Browser | undefined;

  try {
    const { browser: _browser, page } = await setupBrowserAndPage();
    browser = _browser;

    // Enable permissions
    const context = browser.defaultBrowserContext();
    await context.overridePermissions(url, ['clipboard-read', 'clipboard-write']);

    // Navigate to page
    await page.goto(url, {
      waitUntil: ['networkidle0', 'domcontentloaded'],
      timeout: 30000
    });

    const frame = await getFrame(page);

    // Click through menu items
    await clickMenuItem(frame, SELECTORS.fileMenu, 'File menu button', 30000);
    await clickMenuItem(frame, SELECTORS.createCopy, 'Create a Copy');
    await clickMenuItem(frame, SELECTORS.downloadCopy, 'Download a Copy');

    // Handle the download
    await handleFileDownload(DOWNLOAD_PATH, outputPath);

  } catch (error) {
    console.error('Error during page load:', error);
    if (browser) {
      const page = (await browser.pages())[0];
      await saveDebugInfo(page);
    }
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Execute the download
downloadExcelFile(EXCEL_URL, OUTPUT_FILENAME)
  .catch(error => console.error('Error downloading file:', error));

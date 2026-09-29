export default async function run(page) {
  await page.waitForTimeout(4000);
  const body = await page.evaluate(() => document.body.innerText.slice(0, 1400));
  const htmlAttr = await page.evaluate(() => ({
    id: document.getElementById('root')?.innerHTML.slice(0, 200) ?? 'no #root',
    scriptSrcs: Array.from(document.querySelectorAll('script[src]')).map(s => s.getAttribute('src')),
    bg: getComputedStyle(document.body).backgroundColor,
    hh: Array.from(document.querySelectorAll('h1,h2,h3')).map(h => h.textContent.trim()),
  }));
  return {htmlAttr, body};
}
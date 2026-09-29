export default async function run(page) {
  // Log in as admin via the real login form.
  await page.goto('http://localhost:8000/login', {waitUntil: 'domcontentloaded'});
  await page.waitForTimeout(2500);

  const snapshot = await page.evaluate(() =>
    Array.from(document.querySelectorAll('input')).map(i => ({
      name: i.getAttribute('name'), type: i.getAttribute('type'),
    }))
  );

  await page.fill('input[name="email"]', 'admin@keekii.test');
  await page.fill('input[name="password"]', 'password');
  await Promise.all([
    page.waitForURL(u => !u.pathname.includes('/login'), {timeout: 45000}).catch(() => {}),
    page.click('button[type="submit"]'),
  ]);
  await page.waitForTimeout(3000);
  return {after: page.url(), inputs: snapshot};
}

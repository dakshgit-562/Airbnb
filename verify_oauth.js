const fetch = globalThis.fetch;
(async () => {
  const tests = [
    { url: 'http://localhost:3003/login', name: 'LOGIN', opts: undefined },
    { url: 'http://localhost:3003/auth/google', name: 'GOOGLE', opts: { redirect: 'manual' } },
    { url: 'http://localhost:3003/host/add-home', name: 'HOST', opts: { redirect: 'manual' } }
  ];

  for (const test of tests) {
    try {
      const res = await fetch(test.url, test.opts);
      console.log(`${test.name} STATUS: ${res.status}`);
      console.log(`${test.name} LOCATION: ${res.headers.get('location') || 'none'}`);
      if (test.name === 'LOGIN') {
        const html = await res.text();
        console.log('LOGIN FORM:', html.includes('form action="/login"') ? 'OK' : 'MISSING');
        console.log('GOOGLE BUTTON:', html.includes('href="/auth/google"') ? 'OK' : 'MISSING');
      }
    } catch (err) {
      console.error(`${test.name} ERROR:`, err.message);
    }
  }
})();

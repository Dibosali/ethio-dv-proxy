async function testCbePortal() {
  const urls = [
    'https://mbreciept.cbe.com.et/FT26278654BP',
    'https://mbreceipt.cbe.com.et/FT26278654BP',
    'https://apps.cbe.com.et:8443/mbreceipt/FT26278654BP',
    'http://mbreciept.cbe.com.et/FT26278654BP'
  ];

  for (const url of urls) {
    console.log(`Trying ${url}...`);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);
      console.log(`Status: ${res.status}`);
      const text = await res.text();
      console.log(`Body preview: ${text.slice(0, 150)}`);
    } catch (err: any) {
      console.log(`Failed: ${err.message || err}`);
    }
  }
}

testCbePortal();

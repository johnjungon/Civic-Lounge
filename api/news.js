// ═══════════════════════════════════════
//  전자영접실 – Naver News API Route
//  Vercel Serverless Function
// ═══════════════════════════════════════

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const query = encodeURIComponent('전자영 경기도의원');
    const url   = `https://openapi.naver.com/v1/search/news.json?query=${query}&display=3&sort=date`;

    const naverRes = await fetch(url, {
      headers: {
        'X-Naver-Client-Id'    : process.env.NAVER_CLIENT_ID,
        'X-Naver-Client-Secret': process.env.NAVER_CLIENT_SECRET,
      },
    });

    if (!naverRes.ok) {
      throw new Error(`Naver API error: ${naverRes.status}`);
    }

    const data     = await naverRes.json();
    const articles = data.items.map(item => ({
      title      : item.title.replace(/<[^>]+>/g, '').replace(/&quot;/g, '"').replace(/&amp;/g, '&'),
      description: item.description.replace(/<[^>]+>/g, '').replace(/&quot;/g, '"').replace(/&amp;/g, '&'),
      link       : item.link,
      pubDate    : item.pubDate,
      source     : (() => {
        try { return new URL(item.originallink || item.link).hostname.replace('www.', ''); }
        catch { return '뉴스'; }
      })(),
    }));

    return res.status(200).json({ articles });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

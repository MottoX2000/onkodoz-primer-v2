/**
 * Bonus: kendi sunucumuzdaki tüketici (FastAPI + onnxruntime, Render.com) vs Python Oracle.
 * Sunucu adresi tests/sunucu_url.txt dosyasından okunur.
 */
describe('Bonus Diferansiyel Test — Sunucu (/predict) vs Python Oracle', () => {
  it('5 referans girdide |p_sunucu - p_python| < tolerans', () => {
    cy.readFile('tests/sunucu_url.txt').then((raw) => {
      const url = raw.trim().replace(/\/$/, '');
      cy.readFile('tests/parite.json').then((ref) => {
        ref.girdiler.forEach((g) => {
          cy.request({ method: 'POST', url: `${url}/predict`, body: { x: g.x }, timeout: 90000 }).then((res) => {
            const fark = Math.abs(res.body.p - g.p);
            cy.log(`${g.ad}: sunucu=${res.body.p} python=${g.p} |fark|=${fark.toExponential(2)}`);
            expect(fark, `${g.ad} sunucu parite farkı`).to.be.lessThan(ref.tolerans);
          });
        });
      });
    });
  });
});

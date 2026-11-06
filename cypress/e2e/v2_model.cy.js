/**
 * The Primer v2.0 — Model testleri
 *  (a) Diferansiyel test: Python Oracle (tests/parite.json) vs. tarayıcı onnxruntime-web, |fark| < 1e-4
 *  (b) Kabul Örneği 6 & 7: aynı sahnede (S2) iki farklı oyuncu → model iki farklı karar verir
 * Regresyon: v1 testleri cypress/e2e/onkodoz.cy.js içinde değişmeden koşar.
 */
const PAUSE = 1500;

describe('v2.0 Diferansiyel Test (Parite) — Python Oracle vs onnxruntime-web', () => {
  it('5 referans girdide |p_web - p_python| < tolerans', () => {
    cy.readFile('tests/parite.json').then((ref) => {
      ref.girdiler.forEach((g) => {
        cy.visit(`/?parite=1&x=${g.x.join(',')}`);
        cy.get('[data-cy="p"]', { timeout: 20000 })
          .invoke('text')
          .then((txt) => {
            const pWeb = parseFloat(txt);
            const fark = Math.abs(pWeb - g.p);
            cy.log(`${g.ad}: web=${pWeb} python=${g.p} |fark|=${fark.toExponential(2)}`);
            expect(fark, `${g.ad} parite farkı`).to.be.lessThan(ref.tolerans);
          });
      });
    });
  });
});

describe('v2.0 Kabul Örnekleri 6 & 7 — aynı sahnede iki oyuncu, iki farklı model kararı', () => {
  beforeEach(() => {
    cy.viewport(375, 812);
  });

  it('Kabul Örneği 6: aceleci deneyimli oyuncu (S1 = B, hızlı) → S2 model uyarısı + 30 sn', () => {
    cy.visit('/');
    cy.get('[data-cy="select-level-senior"]').click();
    cy.get('[data-cy="select-role-backend"]').click();
    cy.get('[data-cy="start-game-btn"]').click();

    cy.get('[data-cy="model-off"]').should('be.visible');
    cy.get('[data-cy="option-b-btn"]').click(); // hızlı + riskli
    cy.get('[data-cy="feedback-what"]').should('be.visible');
    cy.wait(PAUSE);
    cy.get('[data-cy="next-stage-btn"]').click();

    cy.get('[data-cy="p"]', { timeout: 20000 })
      .invoke('text')
      .then((t) => expect(parseFloat(t)).to.be.at.least(0.5));
    cy.get('[data-cy="model-nudge"]').should('be.visible').and('contain.text', '+30 sn');
    cy.get('[data-cy="timer-display"]').should('contain.text', '01:');
    cy.wait(PAUSE * 2);
  });

  it('Kabul Örneği 7: temkinli yeni oyuncu (Tutor açtı, S1 = A, 40 sn) → S2 uyarı yok', () => {
    cy.clock();
    cy.visit('/');
    cy.get('[data-cy="select-level-beginner"]').click();
    cy.get('[data-cy="select-role-qa"]').click();
    cy.get('[data-cy="start-game-btn"]').click();

    cy.get('[data-cy="tutor-toggle-btn"]').click();
    cy.get('[data-cy="tutor-toggle-btn"]').click();
    cy.tick(40000); // 40 sn düşünme süresi
    cy.get('[data-cy="option-a-btn"]').click();
    cy.get('[data-cy="feedback-what"]').should('be.visible');
    cy.clock().then((clock) => clock.restore());
    cy.get('[data-cy="next-stage-btn"]').click();

    cy.get('[data-cy="p"]', { timeout: 20000 })
      .invoke('text')
      .then((t) => expect(parseFloat(t)).to.be.lessThan(0.5));
    cy.get('[data-cy="model-nudge"]').should('not.exist');
    cy.get('[data-cy="beginner-hint-card"]').should('be.visible');
    cy.wait(PAUSE * 2);
  });
});

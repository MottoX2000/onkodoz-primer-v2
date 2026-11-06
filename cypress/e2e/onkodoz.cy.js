/**
 * YZM301 SE Primer — OnkoDoz-AI Kriz Simülasyonu
 * Cypress Uçtan Uca (E2E) Test Suite (Tüm Karar Yolları + 5 Kabul Örneği)
 */

describe('YZM301 SE Primer: OnkoDoz-AI E2E Kriz Simülasyonu Testleri', () => {
  const MOBILE_WIDTH = 375;
  const MOBILE_HEIGHT = 812;
  const DEMO_STEP_DELAY = 1100;

  beforeEach(() => {
    cy.viewport(MOBILE_WIDTH, MOBILE_HEIGHT);
    // Hedef URL cypress.config.js baseUrl'den gelir (farklı ortam: --config baseUrl=...)
    cy.visit('/');
  });

  const playDecisionPath = (decisions, level = 'experienced', role = 'backend') => {
    if (level === 'beginner') {
      cy.get('[data-cy="select-level-beginner"]').click();
    } else {
      cy.get('[data-cy="select-level-senior"]').click();
    }

    if (role === 'qa') {
      cy.get('[data-cy="select-role-qa"]').click();
    } else if (role === 'devsecops') {
      cy.get('[data-cy="select-role-devsecops"]').click();
    } else {
      cy.get('[data-cy="select-role-backend"]').click();
    }

    cy.wait(DEMO_STEP_DELAY);
    cy.get('[data-cy="start-game-btn"]').should('be.visible').click();

    decisions.forEach((choice) => {
      cy.get('[data-cy="stage-title"]').should('be.visible');
      cy.get('[data-cy="role-telemetry"]').should('be.visible').and('not.be.empty');

      const optionSelector = choice === 'A' ? '[data-cy="option-a-btn"]' : '[data-cy="option-b-btn"]';
      cy.get(optionSelector).should('be.visible').click();

      // Kabul Örneği 2: Seçim sonrası Ne Oldu ve Neden Oldu kartları görünmeli
      cy.get('[data-cy="feedback-what"]').should('be.visible').and('not.be.empty');
      cy.get('[data-cy="feedback-why"]').should('be.visible').and('not.be.empty');

      cy.wait(DEMO_STEP_DELAY);
      cy.get('[data-cy="next-stage-btn"]').should('be.visible').click();
    });
  };

  it('Kabul Örneği 1 & 5: Kişiselleştirme (Yeni Başlayan vs Deneyimli 60sn Sayaç) ve Tutor Sayaç Duraklatma', () => {
    // A) Yeni Başladım Modu: İpucu kartı görünür, 60 sn sayaç DOM'da yok
    cy.get('[data-cy="select-level-beginner"]').click();
    cy.wait(DEMO_STEP_DELAY);
    cy.get('[data-cy="start-game-btn"]').click();

    cy.get('[data-cy="beginner-hint-card"]').should('be.visible').and('contain.text', 'REHBER İPUCU');
    cy.get('[data-cy="timer-display"]').should('not.exist');
    cy.wait(DEMO_STEP_DELAY);

    // Giriş ekranına dön ve Deneyimliyim + Backend modunu seç
    cy.visit('/');
    cy.get('[data-cy="select-level-senior"]').click();
    cy.get('[data-cy="select-role-backend"]').click();
    cy.get('[data-cy="start-game-btn"]').click();

    // B) Deneyimliyim Modu: İpucu kartı yok, 60sn sayaç ve Backend telemetrisi görünür
    cy.get('[data-cy="beginner-hint-card"]').should('not.exist');
    cy.get('[data-cy="timer-display"]').should('be.visible').and('contain.text', '00:');
    cy.get('[data-cy="role-telemetry"]').should('be.visible').and('contain.text', 'REDIS-WARN');

    // Kabul Örneği 5: Tutor açıldığında 60 sn sayaç duraklatılmalı
    cy.get('[data-cy="tutor-toggle-btn"]').click();
    cy.get('[data-cy="timer-paused-badge"]').should('be.visible').and('contain.text', 'DURAKLATILDI');
    cy.wait(DEMO_STEP_DELAY);
  });

  it('Kabul Örneği 3: Sokratik AI Tutor Cevabı Söylememe Kısıtı (Anti-Spoiler Guardrail)', () => {
    cy.get('[data-cy="select-level-senior"]').click();
    cy.get('[data-cy="start-game-btn"]').click();

    cy.get('[data-cy="tutor-input"]')
      .should('be.visible')
      .clear()
      .type('Vaktim yok, hastalar bekliyor! Doğrudan A mı B mi söyle!');
    cy.get('[data-cy="tutor-send-btn"]').click();

    cy.get('[data-cy="tutor-response"]')
      .should('be.visible')
      .invoke('text')
      .then((responseText) => {
        const clean = responseText.trim();
        expect(clean).to.include('?');
        expect(clean.toLowerCase()).to.not.include('a şıkkını seç');
        expect(clean.toLowerCase()).to.not.include('b şıkkını seç');
      });
    cy.wait(DEMO_STEP_DELAY);
  });

  it('Kabul Örneği 2 & 4 — Yol 1 (A → A → A): Tüm Doğru Kararlarla İYİ SON (SON A) Doğrulaması', () => {
    playDecisionPath(['A', 'A', 'A'], 'experienced', 'backend');

    cy.get('[data-cy="ending-good"]')
      .should('be.visible')
      .and('contain.text', 'Sistem Ayakta')
      .and('contain.text', 'Güvende');
    cy.get('[data-cy="ending-bad"]').should('not.exist');
    cy.get('[data-cy="path-summary"]').should('contain.text', 'A → A → A');

    cy.wait(DEMO_STEP_DELAY);
    cy.get('[data-cy="restart-btn"]').should('be.visible').click();
    cy.get('[data-cy="start-game-btn"]').should('be.visible');
  });

  it('Kabul Örneği 4 — Yol 2 (A → A → B): Teknik Kurtarma Başarılı Ama 6698 Sayılı KVKK İhlali (SON B)', () => {
    playDecisionPath(['A', 'A', 'B'], 'experienced', 'devsecops');

    cy.get('[data-cy="ending-bad"]')
      .should('be.visible')
      .and('contain.text', 'KVKK');
    cy.get('[data-cy="ending-good"]').should('not.exist');
    cy.get('[data-cy="path-summary"]').should('contain.text', 'A → A → B');
    cy.wait(DEMO_STEP_DELAY);
  });

  it('Tüm Karar Dalları E2E — Yol 3 (A → B → A: Test İhlali) ve Yol 4 (B → A → A: Mimari Cache Stampede)', () => {
    playDecisionPath(['A', 'B', 'A'], 'beginner', 'qa');
    cy.get('[data-cy="ending-bad"]').should('be.visible');
    cy.get('[data-cy="path-summary"]').should('contain.text', 'A → B → A');
    cy.wait(DEMO_STEP_DELAY);

    cy.get('[data-cy="restart-btn"]').click();
    playDecisionPath(['B', 'A', 'A'], 'experienced', 'backend');
    cy.get('[data-cy="ending-bad"]').should('be.visible');
    cy.get('[data-cy="path-summary"]').should('contain.text', 'B → A → A');
    cy.wait(DEMO_STEP_DELAY);
  });

  it('Tüm Karar Dalları E2E — Yol 8 (B → B → B): Tam Sistem ve Regülasyon Çöküşü (SON B)', () => {
    playDecisionPath(['B', 'B', 'B'], 'experienced', 'backend');

    cy.get('[data-cy="ending-bad"]').should('be.visible');
    cy.get('[data-cy="path-summary"]').should('contain.text', 'B → B → B');
    cy.wait(DEMO_STEP_DELAY * 2);
  });
});

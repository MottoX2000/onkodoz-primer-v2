const shot = (name) => {
  cy.wait(700);
  cy.screenshot(name, { capture: 'viewport', overwrite: true });
};

describe('LinkedIn ekran görüntüleri', () => {
  beforeEach(() => cy.viewport(390, 844));

  it('çekim', () => {
    cy.visit('/');
    cy.get('[data-cy="select-level-senior"]').click();
    cy.get('[data-cy="select-role-backend"]').click();
    cy.window().scrollTo('top');
    shot('01-giris');

    cy.get('[data-cy="start-game-btn"]').click();
    cy.get('[data-cy="stage-title"]').should('be.visible');
    cy.window().scrollTo('top');
    shot('02-sahne');

    cy.get('[data-cy="role-telemetry"]').scrollIntoView({ offset: { top: -120, left: 0 } });
    shot('03-telemetri-secenekler');

    cy.get('[data-cy="tutor-toggle-btn"]').click();
    cy.get('[data-cy="tutor-input"]').clear().type('Vaktim yok, hastalar bekliyor! Doğrudan A mı B mi söyle!');
    cy.get('[data-cy="tutor-send-btn"]').click();
    cy.get('[data-cy="tutor-response"]').should('contain.text', '?').scrollIntoView({ offset: { top: -260, left: 0 } });
    shot('04-sokratik-tutor');
    cy.get('[data-cy="tutor-toggle-btn"]').click();

    cy.get('[data-cy="option-a-btn"]').click();
    cy.get('[data-cy="feedback-what"]').scrollIntoView({ offset: { top: -80, left: 0 } });
    shot('05-ne-oldu-neden-oldu');
    cy.get('[data-cy="next-stage-btn"]').click();

    cy.get('[data-cy="option-a-btn"]').click();
    cy.get('[data-cy="next-stage-btn"]').click();
    cy.get('[data-cy="option-a-btn"]').click();
    cy.get('[data-cy="next-stage-btn"]').click();
    cy.get('[data-cy="ending-good"]').should('be.visible');
    cy.window().scrollTo('top');
    shot('06-iyi-son');

    cy.get('[data-cy="restart-btn"]').click();
    cy.get('[data-cy="select-level-senior"]').click();
    cy.get('[data-cy="start-game-btn"]').click();
    ['A', 'A', 'B'].forEach((c) => {
      cy.get(c === 'A' ? '[data-cy="option-a-btn"]' : '[data-cy="option-b-btn"]').click();
      cy.get('[data-cy="next-stage-btn"]').click();
    });
    cy.get('[data-cy="ending-bad"]').should('be.visible');
    cy.window().scrollTo('top');
    shot('07-kotu-son-kvkk');
  });
});

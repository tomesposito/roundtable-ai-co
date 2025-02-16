describe('Roundtable Chat Interface End-to-End Test', () => {
    // Before running tests, set up a simulated roundtable in local storage.
    before(() => {
      cy.visit('/'); // Visit the home page to ensure the app loads
      cy.window().then((win) => {
        const roundtable = {
          roundtableId: 'testRoundtable123',
          name: 'Test Roundtable',
          gptConfigs: ['config1', 'config2'] // Simulated GPT config IDs
        };
        win.localStorage.setItem('currentRoundtable', JSON.stringify(roundtable));
      });
    });
  
    it('should allow the user to send a message and receive GPT responses in turn', () => {
      cy.visit('/chat');
  
      // Verify that the chat interface loads
      cy.contains('Roundtable Chat').should('exist');
  
      // Type a message into the input field and send it
      cy.get('input[placeholder="Type your message..."]')
        .type('Hello, is anyone there?{enter}');
  
      // Wait for simulated responses (each simulated response delays 1s; we have 2 GPT responses)
      cy.wait(2500);
  
      // Check that the user's message is displayed
      cy.get('.border.p-3.mb-3').should('contain', 'User: Hello, is anyone there?');
  
      // Check that responses from GPTs are displayed (using the simulated response text)
      cy.get('.border.p-3.mb-3').should('contain', 'Response from GPT config config1 to: "Hello, is anyone there?"');
      cy.get('.border.p-3.mb-3').should('contain', 'Response from GPT config config2 to: "Hello, is anyone there?"');
    });
  });
// Force injection that will work
(function() {
    let attempts = 0;
    const maxAttempts = 100;
    
    function tryAddButton() {
        attempts++;
        
        if (attempts > maxAttempts) {
            console.log("Max attempts reached");
            return;
        }
        
        // Check if we're in payment screen
        if (!window.location.href.includes('/pos/ui')) {
            setTimeout(tryAddButton, 1000);
            return;
        }
        
        // Find Validar button
        const validar = document.querySelector('.next.validation') ||
                       document.querySelector('[class*="validar" i]') ||
                       Array.from(document.querySelectorAll('div')).find(el => 
                           el.textContent && el.textContent.trim() === 'Validar');
        
        if (!validar) {
            setTimeout(tryAddButton, 500);
            return;
        }
        
        // Check if already added
        if (document.querySelector('.kitchen-module-btn')) {
            return;
        }
        
        // Create button
        const btn = validar.cloneNode(true);
        btn.className = (btn.className || '') + ' kitchen-module-btn';
        btn.style.background = '#ff6b35';
        btn.textContent = '🍴 COMANDA';
        btn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const w = window.open('', '', 'width=400,height=600');
            w.document.write(`
                <html><body onload="print(); setTimeout(() => close(), 500);">
                <h2>COMANDA COCINA</h2>
                <p>${new Date().toLocaleString()}</p>
                </body></html>
            `);
        };
        
        validar.parentNode.insertBefore(btn, validar);
        console.log("Kitchen button added!");
    }
    
    // Start trying
    setTimeout(tryAddButton, 100);
})();

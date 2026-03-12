// JavaScript für das Lebenslauf-Modal mit PDF.js Integration für iOS-Kompatibilität

document.addEventListener('DOMContentLoaded', function() {
    // Referenzen zu den Elementen
    const resumeBtn = document.querySelector('.resume-btn');
    const modal = document.getElementById('resume-modal');
    const closeBtn = document.querySelector('.close-modal');
    const downloadBtn = document.getElementById('download-resume');
    const pdfContainer = document.getElementById('pdf-container');
    const pdfIframe = document.getElementById('pdf-iframe');
    const pdfJsContainer = document.getElementById('pdfjs-container');
    const modalTitle = document.querySelector('#resume-modal .modal-title');
    const downloadText = document.querySelector('#download-resume span');
    const iosHint = document.getElementById('ios-download-hint');
    
    // Erkennung von iOS/Safari
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    
    // PDF.js Worker konfigurieren
    if (isIOS || isSafari) {
        if (typeof pdfjsLib !== 'undefined') {
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
        }
    }
    
    // Übersetzungsfunktion für das Modal
    function updateModalTranslations(lang) {
        if (modalTitle && translations && translations[lang]) {
            modalTitle.textContent = translations[lang]['resume_title'];
        }
        if (downloadText && translations && translations[lang]) {
            downloadText.textContent = translations[lang]['resume_download'];
        }
        if (iosHint && translations && translations[lang]) {
            iosHint.textContent = translations[lang]['resume_ios_hint'];
        }
    }
    
    // Event-Listener für Sprachänderungen
    document.addEventListener('languageChanged', function(e) {
        updateModalTranslations(e.detail.language);
    });
    
    // Modal öffnen, wenn auf den Lebenslauf-Button geklickt wird
    if (resumeBtn) {
        resumeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            
            const currentLang = document.documentElement.getAttribute('lang') || 'de';
            updateModalTranslations(currentLang);
            
            setTimeout(() => {
                modal.classList.add('show');
            }, 10);
            
            // PDF immer mit PDF.js laden (für alle Browser)
            pdfIframe.style.display = 'none';
            pdfJsContainer.style.display = 'block';
            
            if (!pdfJsContainer.hasAttribute('data-loaded')) {
                loadPdfWithPdfJs('assets/pdf/Lebenslauf_AstridKraft.pdf', pdfJsContainer);
                pdfJsContainer.setAttribute('data-loaded', 'true');
            }
        });
    }
    
    // PDF mit PDF.js laden
    function loadPdfWithPdfJs(url, container) {
        if (typeof pdfjsLib === 'undefined') {
            container.innerHTML = '<p style="padding:2rem; text-align:center; color:red;">PDF.js Bibliothek nicht geladen.</p>';
            return;
        }
        
        container.innerHTML = '<p style="padding:2rem; text-align:center;">PDF wird geladen...</p>';
        
        const loadingTask = pdfjsLib.getDocument(url);
        loadingTask.promise.then(function(pdf) {
            container.innerHTML = '';
            
            // Seiten nacheinander laden (bessere Performance)
            let pageNum = 1;
            
            function renderPage() {
                if (pageNum > pdf.numPages) return;
                
                pdf.getPage(pageNum).then(function(page) {
                    const viewport = page.getViewport({ scale: 1.2 });
                    
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;
                    canvas.style.width = '100%';
                    canvas.style.height = 'auto';
                    canvas.style.marginBottom = '15px';
                    canvas.style.border = '1px solid #ccc';
                    canvas.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
                    
                    const pageContainer = document.createElement('div');
                    pageContainer.className = 'pdf-page';
                    pageContainer.style.marginBottom = '20px';
                    pageContainer.appendChild(canvas);
                    container.appendChild(pageContainer);
                    
                    page.render({
                        canvasContext: context,
                        viewport: viewport
                    }).promise.then(function() {
                        pageNum++;
                        renderPage(); // Nächste Seite rendern
                    });
                });
            }
            
            renderPage(); // Start mit Seite 1
            
        }).catch(function(error) {
            container.innerHTML = `<p style="padding:2rem; text-align:center; color:red;">
                Fehler beim Laden der PDF: ${error.message || error}<br>
                <a href="assets/pdf/Lebenslauf_AstridKraft.pdf" target="_blank" style="color:blue; text-decoration:underline;">PDF direkt öffnen</a>
            </p>`;
        });
    }
    
    // Modal schließen
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) closeModal();
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.style.display === 'flex') closeModal();
    });
    
    function closeModal() {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, 300);
    }
    
    // ULTIMATIVE Download-Funktion für Safari
    downloadBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        const pdfUrl = 'assets/pdf/Lebenslauf_AstridKraft.pdf';
        const fileName = 'Lebenslauf_AstridKraft.pdf';
        
        // iOS/Safari-Hinweis anzeigen
        iosHint.style.display = 'block';
        
        if (isIOS || isSafari) {
            // SAFARI: Direkter Download-Link mit Schritt-für-Schritt-Anleitung
            iosHint.innerHTML = `
                <div style="padding:15px; background:#f8f9fa; border-radius:8px;">
                    <p style="margin-bottom:10px; font-weight:bold; color:#0a3d62;">📱 PDF speichern auf iOS/Safari:</p>
                    <ol style="text-align:left; margin-bottom:15px; padding-left:20px;">
                        <li style="margin-bottom:10px;">👉 <strong>Tippe und halte</strong> auf den Link unten</li>
                        <li style="margin-bottom:10px;">📥 Wähle im Menü <strong>"Download verknüpfter Datei"</strong></li>
                        <li style="margin-bottom:10px;">📁 Wähle Speicherort (z.B. "Auf meinem iPhone")</li>
                    </ol>
                    <a href="${pdfUrl}" 
                       style="display:block; padding:15px 20px; background:#0a3d62; color:white; 
                              border-radius:8px; text-decoration:none; font-weight:bold; text-align:center;
                              border:2px solid #0a3d62;"
                       target="_blank">
                        📄 Lebenslauf_AstridKraft.pdf (tippen & halten)
                    </a>
                    <p style="margin-top:15px; font-size:0.9rem; color:#666;">
                        Funktioniert der Download nicht? In den iOS-Einstellungen unter "Safari" → "Downloads" prüfen.
                    </p>
                </div>
            `;
            
            // Zusätzlicher Versuch mit Blob (manchmal erfolgreich)
            try {
                fetch(pdfUrl)
                    .then(response => response.blob())
                    .then(blob => {
                        const blobUrl = window.URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = blobUrl;
                        link.download = fileName;
                        link.style.display = 'none';
                        document.body.appendChild(link);
                        link.click();
                        setTimeout(() => {
                            document.body.removeChild(link);
                            window.URL.revokeObjectURL(blobUrl);
                        }, 1000);
                    })
                    .catch(() => {});
            } catch (e) {}
            
            // Hinweis für 15 Sekunden anzeigen (länger wegen Anleitung)
            setTimeout(() => {
                iosHint.style.display = 'none';
                // Originaltext wiederherstellen
                const currentLang = document.documentElement.getAttribute('lang') || 'de';
                if (translations && translations[currentLang]) {
                    iosHint.textContent = translations[currentLang]['resume_ios_hint'];
                }
            }, 15000);
            
        } else {
            // Für Chrome, Firefox, Edge: Standard-Download
            iosHint.innerHTML = '<p style="padding:10px;">✅ Download gestartet...</p>';
            
            const link = document.createElement('a');
            link.href = pdfUrl;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Hinweis nach 2 Sekunden ausblenden
            setTimeout(() => {
                iosHint.style.display = 'none';
            }, 2000);
        }
    });
});

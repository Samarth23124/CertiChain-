document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const certificateForm = document.getElementById('certificateForm');
    const verificationForm = document.getElementById('verificationForm');
    const verificationResult = document.getElementById('verificationResult');
    const resultContent = document.getElementById('resultContent');
    const blockCount = document.getElementById('blockCount');
    const certificateCount = document.getElementById('certificateCount');
    const chainStatus = document.getElementById('chainStatus');
    const lastUpdate = document.getElementById('lastUpdate');
    const blockchainContainer = document.getElementById('blockchainContainer');
    const blockDetails = document.getElementById('blockDetails');
    const blockDetailsContent = document.getElementById('blockDetailsContent');
    const themeToggle = document.getElementById('themeToggle');
    const previewBtn = document.getElementById('previewBtn');
    const previewModal = document.getElementById('previewModal');
    const closePreviewModal = document.getElementById('closePreviewModal');
    const downloadPreviewBtn = document.getElementById('downloadPreviewBtn');
    const issueFromPreviewBtn = document.getElementById('issueFromPreviewBtn');
    const closeBlockDetails = document.getElementById('closeBlockDetails');
    const downloadResultBtn = document.getElementById('downloadResultBtn');
    const shareResultBtn = document.getElementById('shareResultBtn');
    const verifyOptions = document.querySelectorAll('.verify-option');
    const idVerification = document.getElementById('idVerification');
    const hashVerification = document.getElementById('hashVerification');
    const qrVerification = document.getElementById('qrVerification');
    const blockSearch = document.getElementById('blockSearch');
    const searchBtn = document.getElementById('searchBtn');
    const blockFilter = document.getElementById('blockFilter');
    const exportDataBtn = document.getElementById('exportDataBtn');
    const importDataBtn = document.getElementById('importDataBtn');
    const resetDataBtn = document.getElementById('resetDataBtn');
    const notificationSetting = document.getElementById('notificationSetting');
    const notificationDurationSetting = document.getElementById('notificationDurationSetting');
    const themeSetting = document.getElementById('themeSetting');
    const fontSizeSetting = document.getElementById('fontSizeSetting');
    const difficultySetting = document.getElementById('difficultySetting');
    const blockSizeSetting = document.getElementById('blockSizeSetting');
    const notification = document.getElementById('notification');

    // Check if all required elements exist
    if (!certificateForm || !verificationForm || !blockchainContainer) {
        console.error('Critical DOM elements missing. Application may not function properly.');
        showNotification('Application initialization error. Please refresh the page.', 'error');
        return;
    }

    // Tab switching functionality
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            
            // Update active states
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            button.classList.add('active');
            const targetTab = document.getElementById(tabId);
            if (targetTab) {
                targetTab.classList.add('active');

                // Update blockchain visualization when switching to explorer tab
                if (tabId === 'explorer') {
                    updateBlockchainVisualization();
                }
            }
        });
    });

    // Theme toggle functionality
    if (themeToggle) {
        themeToggle.addEventListener('change', () => {
            if (themeToggle.checked) {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
            } else {
                document.documentElement.setAttribute('data-theme', 'light');
                localStorage.setItem('theme', 'light');
            }
        });

        // Load saved theme preference
        const savedTheme = localStorage.getItem('theme') || 'light';
        if (savedTheme === 'dark') {
            themeToggle.checked = true;
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    }

    // Verify options switching
    if (verifyOptions.length > 0) {
        verifyOptions.forEach(option => {
            option.addEventListener('click', () => {
                const optionType = option.getAttribute('data-option');
                
                // Update active states
                verifyOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                
                // Show/hide verification methods
                if (idVerification) idVerification.classList.add('hidden');
                if (hashVerification) hashVerification.classList.add('hidden');
                
                if (optionType === 'id' && idVerification) {
                    idVerification.classList.remove('hidden');
                } else if (optionType === 'hash' && hashVerification) {
                    hashVerification.classList.remove('hidden');
                }
            });
        });
    }

    // Function to show notification
    function showNotification(message, type = 'success') {
        // Check if notifications are enabled in settings
        if (notificationSetting && !notificationSetting.checked) return;
        
        if (!notification) {
            console.error('Notification element not found');
            return;
        }
        
        const messageElement = notification.querySelector('.notification-message');
        const iconElement = notification.querySelector('.notification-icon');

        if (!messageElement || !iconElement) {
            console.error('Notification elements not found');
            return;
        }

        messageElement.textContent = message;
        notification.className = `notification ${type}`;
        iconElement.className = `notification-icon fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`;
        
        notification.classList.remove('hidden');
        
        // Get notification duration from settings
        const duration = notificationDurationSetting ? parseInt(notificationDurationSetting.value) : 3000;
        
        setTimeout(() => {
            notification.classList.add('hidden');
        }, duration);
    }

    // Function to update stats
    async function updateStats() {
        try {
            const response = await fetch('http://localhost:3001/api/chain');
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success) {
                if (blockCount) blockCount.textContent = data.chain.length;
                if (certificateCount) certificateCount.textContent = data.chain.length - 1; // Subtract genesis block
                if (chainStatus) {
                    chainStatus.textContent = data.isValid ? 'Valid' : 'Invalid';
                    chainStatus.style.color = data.isValid ? 'var(--success-color)' : 'var(--error-color)';
                }
                
                // Update last update time
                const now = new Date();
                if (lastUpdate) lastUpdate.textContent = now.toLocaleTimeString();
                
                // Update blockchain visualization if on explorer tab
                if (document.querySelector('.tab-btn[data-tab="explorer"]')?.classList.contains('active')) {
                    updateBlockchainVisualization();
                }
            } else {
                console.error('Error updating stats:', data.message);
            }
        } catch (error) {
            console.error('Error updating stats:', error);
            showNotification('Error connecting to blockchain server', 'error');
        }
    }

    // Function to update blockchain visualization
    async function updateBlockchainVisualization() {
        try {
            const response = await fetch('http://localhost:3001/api/chain');
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success && blockchainContainer) {
                blockchainContainer.innerHTML = '';
                data.chain.forEach((block, index) => {
                    const blockElement = document.createElement('div');
                    blockElement.className = 'block';
                    blockElement.innerHTML = `
                        <div class="block-header">
                            <i class="fas fa-cube"></i>
                            <span>Block ${index}</span>
                        </div>
                        <div class="block-hash">${block.hash.substring(0, 20)}...</div>
                    `;
                    
                    blockElement.addEventListener('click', () => showBlockDetails(block, index));
                    blockchainContainer.appendChild(blockElement);
                });
            }
        } catch (error) {
            console.error('Error updating blockchain visualization:', error);
            showNotification('Error loading blockchain data', 'error');
        }
    }

    // Function to show block details
    function showBlockDetails(block, index) {
        if (!blockDetails || !blockDetailsContent) return;
        
        blockDetails.classList.remove('hidden');
        
        const timestamp = new Date(block.timestamp).toLocaleString();
        const data = block.data;
        
        let dataContent = '';
        if (index === 0) {
            dataContent = '<p>Genesis Block</p>';
        } else {
            dataContent = `
                <div class="detail-row">
                    <i class="fas fa-id-card"></i>
                    <div>
                        <label>Certificate ID</label>
                        <p>${data.certificateId || 'N/A'}</p>
                    </div>
                </div>
                <div class="detail-row">
                    <i class="fas fa-user-graduate"></i>
                    <div>
                        <label>Student Name</label>
                        <p>${data.studentName || 'N/A'}</p>
                    </div>
                </div>
                <div class="detail-row">
                    <i class="fas fa-book"></i>
                    <div>
                        <label>Course Name</label>
                        <p>${data.courseName || 'N/A'}</p>
                    </div>
                </div>
                <div class="detail-row">
                    <i class="fas fa-calendar-alt"></i>
                    <div>
                        <label>Issue Date</label>
                        <p>${data.issueDate || 'N/A'}</p>
                    </div>
                </div>
                <div class="detail-row">
                    <i class="fas fa-university"></i>
                    <div>
                        <label>Issuer</label>
                        <p>${data.issuer || 'N/A'}</p>
                    </div>
                </div>
                ${data.certificateType ? `
                <div class="detail-row">
                    <i class="fas fa-graduation-cap"></i>
                    <div>
                        <label>Certificate Type</label>
                        <p>${data.certificateType}</p>
                    </div>
                </div>
                ` : ''}
                ${data.expiryDate ? `
                <div class="detail-row">
                    <i class="fas fa-hourglass-end"></i>
                    <div>
                        <label>Expiry Date</label>
                        <p>${data.expiryDate}</p>
                    </div>
                </div>
                ` : ''}
                ${data.description ? `
                <div class="detail-row">
                    <i class="fas fa-align-left"></i>
                    <div>
                        <label>Description</label>
                        <p>${data.description}</p>
                    </div>
                </div>
                ` : ''}
            `;
        }
        
        blockDetailsContent.innerHTML = `
            <div class="detail-row">
                <i class="fas fa-hashtag"></i>
                <div>
                    <label>Block Hash</label>
                    <p class="hash">${block.hash}</p>
                </div>
            </div>
            <div class="detail-row">
                <i class="fas fa-clock"></i>
                <div>
                    <label>Timestamp</label>
                    <p>${timestamp}</p>
                </div>
            </div>
            <div class="detail-row">
                <i class="fas fa-link"></i>
                <div>
                    <label>Previous Hash</label>
                    <p class="hash">${block.previousHash}</p>
                </div>
            </div>
            <div class="detail-row">
                <i class="fas fa-database"></i>
                <div>
                    <label>Data</label>
                    ${dataContent}
                </div>
            </div>
        `;
    }

    // Close block details
    if (closeBlockDetails && blockDetails) {
        closeBlockDetails.addEventListener('click', () => {
            blockDetails.classList.add('hidden');
        });
    }

    // Preview certificate
    if (previewBtn) {
        previewBtn.addEventListener('click', () => {
            const certificateId = document.getElementById('certificateId')?.value || '';
            const studentName = document.getElementById('studentName')?.value || '';
            const courseName = document.getElementById('courseName')?.value || '';
            const issueDate = document.getElementById('issueDate')?.value || '';
            const issuer = document.getElementById('issuer')?.value || '';
            const certificateType = document.getElementById('certificateType')?.value || '';
            const expiryDate = document.getElementById('expiryDate')?.value || '';
            const description = document.getElementById('description')?.value || '';
            
            if (!certificateId || !studentName || !courseName || !issueDate || !issuer || !certificateType) {
                showNotification('Please fill in all required fields', 'error');
                return;
            }
            
            const previewContent = document.getElementById('previewContent');
            if (!previewContent) return;
            
            previewContent.innerHTML = `
                <div class="certificate-preview">
                    <div class="certificate-header">
                        <div class="certificate-logo">
                            <i class="fas fa-certificate"></i>
                        </div>
                        <h2>Certificate of Completion</h2>
                    </div>
                    <div class="certificate-body">
                        <p class="certificate-text">This is to certify that</p>
                        <h3 class="student-name">${studentName}</h3>
                        <p class="certificate-text">has successfully completed the course</p>
                        <h3 class="course-name">${courseName}</h3>
                        <div class="certificate-details">
                            <div class="detail-item">
                                <span class="detail-label">Certificate ID:</span>
                                <span class="detail-value">${certificateId}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Issue Date:</span>
                                <span class="detail-value">${issueDate}</span>
                            </div>
                            ${expiryDate ? `
                            <div class="detail-item">
                                <span class="detail-label">Expiry Date:</span>
                                <span class="detail-value">${expiryDate}</span>
                            </div>
                            ` : ''}
                            <div class="detail-item">
                                <span class="detail-label">Certificate Type:</span>
                                <span class="detail-value">${certificateType}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Issuer:</span>
                                <span class="detail-value">${issuer}</span>
                            </div>
                        </div>
                        ${description ? `
                        <div class="certificate-description">
                            <p>${description}</p>
                        </div>
                        ` : ''}
                    </div>
                    <div class="certificate-footer">
                        <div class="issuer-signature">
                            <div class="signature-line"></div>
                            <p>${issuer}</p>
                        </div>
                        <div class="certificate-qr">
                            <i class="fas fa-qrcode"></i>
                            <p>Scan to verify</p>
                        </div>
                    </div>
                </div>
            `;
            
            if (previewModal) {
                previewModal.classList.remove('hidden');
            }
        });
    }

    // Close preview modal
    if (closePreviewModal && previewModal) {
        closePreviewModal.addEventListener('click', () => {
            previewModal.classList.add('hidden');
        });
    }

    // Issue certificate from preview
    if (issueFromPreviewBtn && certificateForm) {
        issueFromPreviewBtn.addEventListener('click', () => {
            certificateForm.dispatchEvent(new Event('submit'));
            if (previewModal) {
                previewModal.classList.add('hidden');
            }
        });
    }

    // Download preview
    if (downloadPreviewBtn) {
        downloadPreviewBtn.addEventListener('click', () => {
            // In a real implementation, this would generate a PDF or image of the certificate
            showNotification('Certificate preview downloaded', 'success');
        });
    }

    // Download verification result
    if (downloadResultBtn) {
        downloadResultBtn.addEventListener('click', () => {
            // In a real implementation, this would generate a PDF of the verification result
            showNotification('Verification result downloaded', 'success');
        });
    }

    // Share verification result
    if (shareResultBtn) {
        shareResultBtn.addEventListener('click', () => {
            // In a real implementation, this would share the verification result
            showNotification('Verification result shared', 'success');
        });
    }

    // Search blocks
    if (searchBtn && blockSearch) {
        searchBtn.addEventListener('click', () => {
            const searchTerm = blockSearch.value.toLowerCase();
            if (!searchTerm) return;
            
            const blocks = document.querySelectorAll('.block');
            let found = false;
            
            blocks.forEach(block => {
                const blockText = block.textContent.toLowerCase();
                if (blockText.includes(searchTerm)) {
                    block.style.backgroundColor = 'rgba(74, 108, 247, 0.1)';
                    block.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    found = true;
                } else {
                    block.style.backgroundColor = '';
                }
            });
            
            if (!found) {
                showNotification('No blocks found matching your search', 'error');
            }
        });
    }

    // Filter blocks
    if (blockFilter) {
        blockFilter.addEventListener('change', () => {
            const filterValue = blockFilter.value;
            const blocks = document.querySelectorAll('.block');
            
            blocks.forEach((block, index) => {
                if (filterValue === 'all') {
                    block.style.display = 'flex';
                } else if (filterValue === 'genesis' && index === 0) {
                    block.style.display = 'flex';
                } else if (filterValue === 'certificate' && index > 0) {
                    block.style.display = 'flex';
                } else {
                    block.style.display = 'none';
                }
            });
        });
    }

    // Export blockchain data
    if (exportDataBtn) {
        exportDataBtn.addEventListener('click', async () => {
            try {
                const response = await fetch('http://localhost:3001/api/chain');
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                
                const data = await response.json();
                
                if (data.success) {
                    const dataStr = JSON.stringify(data.chain, null, 2);
                    const dataBlob = new Blob([dataStr], { type: 'application/json' });
                    const url = URL.createObjectURL(dataBlob);
                    
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'blockchain-data.json';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    
                    showNotification('Blockchain data exported successfully', 'success');
                } else {
                    showNotification('Error exporting blockchain data: ' + data.message, 'error');
                }
            } catch (error) {
                console.error('Error exporting blockchain data:', error);
                showNotification('Error exporting blockchain data', 'error');
            }
        });
    }

    // Import blockchain data
    if (importDataBtn) {
        importDataBtn.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            
            input.onchange = async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                
                const reader = new FileReader();
                reader.onload = async (event) => {
                    try {
                        const chain = JSON.parse(event.target.result);
                        
                        const response = await fetch('http://localhost:3001/api/chain/import', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ chain })
                        });
                        
                        if (!response.ok) {
                            throw new Error(`HTTP error! Status: ${response.status}`);
                        }
                        
                        const result = await response.json();
                        
                        if (result.success) {
                            showNotification('Blockchain data imported successfully', 'success');
                            updateStats();
                        } else {
                            showNotification('Error importing blockchain data: ' + result.message, 'error');
                        }
                    } catch (error) {
                        console.error('Error importing blockchain data:', error);
                        showNotification('Error importing blockchain data', 'error');
                    }
                };
                
                reader.readAsText(file);
            };
            
            input.click();
        });
    }

    // Reset blockchain
    if (resetDataBtn) {
        resetDataBtn.addEventListener('click', async () => {
            if (confirm('Are you sure you want to reset the blockchain? This action cannot be undone.')) {
                try {
                    const response = await fetch('http://localhost:3001/api/chain/reset', {
                        method: 'POST'
                    });
                    
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    
                    const result = await response.json();
                    
                    if (result.success) {
                        showNotification('Blockchain reset successfully', 'success');
                        updateStats();
                    } else {
                        showNotification('Error resetting blockchain: ' + result.message, 'error');
                    }
                } catch (error) {
                    console.error('Error resetting blockchain:', error);
                    showNotification('Error resetting blockchain', 'error');
                }
            }
        });
    }

    // Settings changes
    if (themeSetting) {
        themeSetting.addEventListener('change', () => {
            const theme = themeSetting.value;
            if (theme === 'system') {
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
                if (themeToggle) {
                    themeToggle.checked = prefersDark;
                }
            } else {
                document.documentElement.setAttribute('data-theme', theme);
                if (themeToggle) {
                    themeToggle.checked = theme === 'dark';
                }
            }
            localStorage.setItem('theme', theme);
        });
    }

    if (fontSizeSetting) {
        fontSizeSetting.addEventListener('change', () => {
            const fontSize = fontSizeSetting.value;
            document.documentElement.style.fontSize = fontSize === 'small' ? '14px' : 
                                                     fontSize === 'medium' ? '16px' : '18px';
            localStorage.setItem('fontSize', fontSize);
        });
    }

    // Load saved settings
    const savedFontSize = localStorage.getItem('fontSize') || 'medium';
    if (fontSizeSetting) {
        fontSizeSetting.value = savedFontSize;
        document.documentElement.style.fontSize = savedFontSize === 'small' ? '14px' : 
                                                 savedFontSize === 'medium' ? '16px' : '18px';
    }
    
    const savedThemeSetting = localStorage.getItem('themeSetting') || 'light';
    if (themeSetting) {
        themeSetting.value = savedThemeSetting;
    }
    
    const savedNotificationDuration = localStorage.getItem('notificationDuration') || '3000';
    if (notificationDurationSetting) {
        notificationDurationSetting.value = savedNotificationDuration;
    }
    
    const savedNotificationEnabled = localStorage.getItem('notificationEnabled') !== 'false';
    if (notificationSetting) {
        notificationSetting.checked = savedNotificationEnabled;
    }
    
    const savedDifficulty = localStorage.getItem('difficulty') || 'medium';
    if (difficultySetting) {
        difficultySetting.value = savedDifficulty;
    }
    
    const savedBlockSize = localStorage.getItem('blockSize') || 'small';
    if (blockSizeSetting) {
        blockSizeSetting.value = savedBlockSize;
    }

    // Save settings changes
    if (notificationSetting) {
        notificationSetting.addEventListener('change', () => {
            localStorage.setItem('notificationEnabled', notificationSetting.checked);
        });
    }
    
    if (notificationDurationSetting) {
        notificationDurationSetting.addEventListener('change', () => {
            localStorage.setItem('notificationDuration', notificationDurationSetting.value);
        });
    }
    
    if (difficultySetting) {
        difficultySetting.addEventListener('change', () => {
            localStorage.setItem('difficulty', difficultySetting.value);
        });
    }
    
    if (blockSizeSetting) {
        blockSizeSetting.addEventListener('change', () => {
            localStorage.setItem('blockSize', blockSizeSetting.value);
        });
    }

    // Initial stats update
    updateStats();

    // Handle certificate issuance
    if (certificateForm) {
        certificateForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitButton = certificateForm.querySelector('button[type="submit"]');
            if (!submitButton) return;
            
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Issuing Certificate...';

            const certificateData = {
                certificateId: document.getElementById('certificateId')?.value || '',
                studentName: document.getElementById('studentName')?.value || '',
                courseName: document.getElementById('courseName')?.value || '',
                issueDate: document.getElementById('issueDate')?.value || '',
                issuer: document.getElementById('issuer')?.value || '',
                certificateType: document.getElementById('certificateType')?.value || '',
                expiryDate: document.getElementById('expiryDate')?.value || null,
                description: document.getElementById('description')?.value || null
            };

            if (!validateCertificateForm(certificateData)) {
                submitButton.disabled = false;
                submitButton.innerHTML = '<i class="fas fa-plus"></i> Issue Certificate';
                return;
            }

            try {
                // Set a timeout for the fetch request
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

                const response = await fetch('http://localhost:3001/api/certificates', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(certificateData),
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const result = await response.json();

                if (result.success) {
                    showNotification('Certificate successfully issued and added to blockchain!');
                    certificateForm.reset();
                    
                    // Update UI asynchronously
                    Promise.all([
                        safeAsyncOperation(() => updateStats()),
                        safeAsyncOperation(() => updateBlockchainVisualization())
                    ]).catch(error => {
                        console.error('Error updating UI:', error);
                    });
                    
                    submitButton.disabled = true;
                    setTimeout(() => {
                        submitButton.disabled = false;
                        submitButton.innerHTML = '<i class="fas fa-plus"></i> Issue Certificate';
                    }, 3000);
                } else {
                    throw new Error(result.message);
                }
            } catch (error) {
                console.error('Error:', error);
                if (error.name === 'AbortError') {
                    showNotification('Operation timed out. Please try again.', 'error');
                } else {
                    showNotification(error.message || 'Error issuing certificate. Please try again.', 'error');
                }
                submitButton.disabled = false;
                submitButton.innerHTML = '<i class="fas fa-plus"></i> Issue Certificate';
            }
        });
    }

    // Handle certificate verification
    if (verificationForm) {
        verificationForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const verifyButton = verificationForm.querySelector('button[type="submit"]');
            if (!verifyButton) return;
            
            verifyButton.disabled = true;
            verifyButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';

            let certificateId = '';
            
            // Check if we're verifying by hash
            if (idVerification && !idVerification.classList.contains('hidden')) {
                certificateId = document.getElementById('verifyCertificateId')?.value || '';
            } else if (hashVerification && !hashVerification.classList.contains('hidden')) {
                certificateId = document.getElementById('verifyCertificateHash')?.value || '';
            }

            if (!certificateId) {
                showNotification('Please enter a certificate ID or hash to verify', 'error');
                verifyButton.disabled = false;
                verifyButton.innerHTML = '<i class="fas fa-search"></i> Verify Certificate';
                return;
            }

            try {
                const response = await fetch(`http://localhost:3001/api/certificates/${certificateId}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                
                const result = await response.json();

                if (verificationResult) {
                    verificationResult.classList.remove('hidden');
                }

                if (resultContent) {
                    if (result.success) {
                        const certificate = result.certificate;
                        resultContent.innerHTML = `
                            <div class="verification-status">
                                <div class="status-icon">
                                    <i class="fas fa-check-circle"></i>
                                </div>
                                <h3>BlockChain Verified</h3>
                            </div>
                            <div class="verification-details">
                                <div class="detail-row">
                                    <i class="fas fa-hashtag"></i>
                                    <div>
                                        <label>Block Hash</label>
                                        <p class="hash">${result.blockHash || 'N/A'}</p>
                                    </div>
                                </div>
                                <div class="detail-row">
                                    <i class="fas fa-id-card"></i>
                                    <div>
                                        <label>Certificate ID</label>
                                        <p>${certificate.certificateId || 'N/A'}</p>
                                    </div>
                                </div>
                                <div class="detail-row">
                                    <i class="fas fa-clock"></i>
                                    <div>
                                        <label>Verification Date</label>
                                        <p>${new Date().toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        `;
                    } else {
                        resultContent.innerHTML = `
                            <div class="error-message">
                                <i class="fas fa-exclamation-circle"></i>
                                <p>Certificate not found in the blockchain.</p>
                            </div>
                        `;
                    }
                }
            } catch (error) {
                console.error('Error:', error);
                if (verificationResult) {
                    verificationResult.classList.remove('hidden');
                }
                if (resultContent) {
                    resultContent.innerHTML = `
                        <div class="error-message">
                            <i class="fas fa-exclamation-circle"></i>
                            <p>Error verifying certificate. Please try again.</p>
                        </div>
                    `;
                }
            } finally {
                verifyButton.disabled = false;
                verifyButton.innerHTML = '<i class="fas fa-search"></i> Verify Certificate';
            }
        });
    }

    // Add cleanup function for event listeners and resources
    function cleanup() {
        // No chart instances to clean up anymore
    }

    // Add window unload handler
    window.addEventListener('unload', cleanup);

    // Add error boundary for async operations
    async function safeAsyncOperation(operation, fallback = null) {
        try {
            return await operation();
        } catch (error) {
            console.error('Operation failed:', error);
            showNotification('An error occurred. Please try again.', 'error');
            return fallback;
        }
    }

    // Add debounce utility for search and filter operations
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Enhance search functionality with debouncing
    if (searchBtn && blockSearch) {
        const debouncedSearch = debounce(() => {
            const searchTerm = blockSearch.value.toLowerCase();
            if (!searchTerm) return;
            
            const blocks = document.querySelectorAll('.block');
            let found = false;
            
            blocks.forEach(block => {
                const blockText = block.textContent.toLowerCase();
                if (blockText.includes(searchTerm)) {
                    block.style.backgroundColor = 'rgba(74, 108, 247, 0.1)';
                    block.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    found = true;
                } else {
                    block.style.backgroundColor = '';
                }
            });
            
            if (!found) {
                showNotification('No blocks found matching your search', 'error');
            }
        }, 300);

        blockSearch.addEventListener('input', debouncedSearch);
    }

    // Add connection status monitoring
    let isOnline = navigator.onLine;
    window.addEventListener('online', () => {
        isOnline = true;
        showNotification('Connection restored', 'success');
        updateStats();
    });

    window.addEventListener('offline', () => {
        isOnline = false;
        showNotification('Connection lost', 'error');
    });

    // Add form validation utility
    function validateCertificateForm(data) {
        const required = ['certificateId', 'studentName', 'courseName', 'issueDate', 'issuer', 'certificateType'];
        const missing = required.filter(field => !data[field]);
        
        if (missing.length > 0) {
            showNotification(`Please fill in: ${missing.join(', ')}`, 'error');
            return false;
        }
        
        if (data.expiryDate && new Date(data.expiryDate) <= new Date(data.issueDate)) {
            showNotification('Expiry date must be after issue date', 'error');
            return false;
        }
        
        return true;
    }
}); 
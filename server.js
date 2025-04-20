const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Block, Blockchain } = require('./blockchain');

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Initialize blockchain
const certificateChain = new Blockchain();

// API Endpoints
app.post('/api/certificates', (req, res) => {
    const { certificateId, studentName, courseName, issueDate, issuer } = req.body;
    
    const newBlock = new Block(
        new Date().toISOString(),
        {
            certificateId,
            studentName,
            courseName,
            issueDate,
            issuer
        }
    );

    certificateChain.addBlock(newBlock);
    
    res.json({
        success: true,
        message: 'Certificate added to blockchain',
        blockHash: newBlock.hash
    });
});

app.get('/api/certificates/:certificateId', (req, res) => {
    const { certificateId } = req.params;
    const result = certificateChain.verifyCertificate(certificateId);
    
    if (result.found) {
        res.json({
            success: true,
            certificate: result.data,
            blockHash: result.blockHash,
            timestamp: result.timestamp
        });
    } else {
        res.status(404).json({
            success: false,
            message: 'Certificate not found'
        });
    }
});

app.get('/api/chain', (req, res) => {
    res.json({
        success: true,
        chain: certificateChain.chain,
        isValid: certificateChain.isChainValid()
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 
# Technical Documentation: Code Structures

## 1. Block Structure

```javascript
class Block {
    constructor(timestamp, data, previousHash = '') {
        this.timestamp = timestamp;        // Time when block was created
        this.data = data;                  // Certificate data
        this.previousHash = previousHash;  // Hash of previous block
        this.hash = this.calculateHash();  // Current block's hash
        this.nonce = 0;                    // Nonce for mining
    }

    // Calculate hash of the block
    calculateHash() {
        return CryptoJS.SHA256(
            this.previousHash + 
            this.timestamp + 
            JSON.stringify(this.data) + 
            this.nonce
        ).toString();
    }

    // Mine block with given difficulty
    mineBlock(difficulty) {
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
        console.log("Block mined: " + this.hash);
    }
}
```

### Block Data Structure
```javascript
{
    timestamp: Date,          // ISO timestamp
    data: {                   // Certificate information
        certificateId: String,
        studentName: String,
        courseName: String,
        issueDate: String,
        issuer: String
    },
    previousHash: String,     // Hash of previous block
    hash: String,             // Current block's hash
    nonce: Number             // Mining nonce
}
```

## 2. Blockchain Structure

```javascript
class Blockchain {
    constructor() {
        this.chain = [this.createGenesisBlock()];  // Initialize chain with genesis block
        this.difficulty = 2;                       // Mining difficulty
    }

    // Create first block in the chain
    createGenesisBlock() {
        return new Block(
            "01/01/2024", 
            "Genesis Block", 
            "0"
        );
    }

    // Get latest block in the chain
    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    // Add new block to the chain
    addBlock(newBlock) {
        newBlock.previousHash = this.getLatestBlock().hash;
        newBlock.mineBlock(this.difficulty);
        this.chain.push(newBlock);
    }

    // Verify chain integrity
    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            // Check if current block's hash is valid
            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }

            // Check if block is properly linked to previous block
            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }
        return true;
    }

    // Verify certificate in the chain
    verifyCertificate(certificateId) {
        for (let block of this.chain) {
            if (block.data.certificateId === certificateId) {
                return {
                    found: true,
                    data: block.data,
                    blockHash: block.hash,
                    timestamp: block.timestamp
                };
            }
        }
        return { found: false };
    }
}
```

## 3. SQLite Database Model

```sql
-- Certificate Table
CREATE TABLE certificates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    certificate_id VARCHAR(255) UNIQUE NOT NULL,
    student_name VARCHAR(255) NOT NULL,
    course_name VARCHAR(255) NOT NULL,
    issue_date DATETIME NOT NULL,
    issuer VARCHAR(255) NOT NULL,
    block_hash VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Block Table
CREATE TABLE blocks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    block_hash VARCHAR(255) UNIQUE NOT NULL,
    previous_hash VARCHAR(255) NOT NULL,
    timestamp DATETIME NOT NULL,
    nonce INTEGER NOT NULL,
    difficulty INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Transaction Table
CREATE TABLE transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    block_id INTEGER NOT NULL,
    certificate_id INTEGER NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (block_id) REFERENCES blocks(id),
    FOREIGN KEY (certificate_id) REFERENCES certificates(id)
);

-- Indexes
CREATE INDEX idx_certificates_certificate_id ON certificates(certificate_id);
CREATE INDEX idx_blocks_block_hash ON blocks(block_hash);
CREATE INDEX idx_transactions_block_id ON transactions(block_id);
CREATE INDEX idx_transactions_certificate_id ON transactions(certificate_id);
```

### SQLite Model Relationships

1. **One-to-Many Relationship**:
   - One Block can have many Transactions
   - One Certificate can have many Transactions

2. **Foreign Key Constraints**:
   - Transactions reference both Blocks and Certificates
   - Ensures data integrity and referential integrity

3. **Indexes**:
   - Optimized for frequent queries
   - Improves search performance
   - Maintains data integrity

### SQLite Model Features

1. **Data Integrity**:
   - Primary keys for unique identification
   - Foreign key constraints
   - NOT NULL constraints
   - UNIQUE constraints

2. **Timestamps**:
   - Automatic creation timestamps
   - Automatic update timestamps
   - Audit trail capability

3. **Performance**:
   - Indexed columns for faster queries
   - Optimized table structure
   - Efficient data retrieval

4. **Security**:
   - Unique constraints prevent duplicates
   - Foreign key constraints maintain relationships
   - Data validation at database level 
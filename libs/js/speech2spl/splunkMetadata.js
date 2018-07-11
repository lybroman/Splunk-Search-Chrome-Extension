function SplunkMetaData() {
    this.indexMap = new Map();
}

SplunkMetaData.prototype.addIndex = function(indexName) {
    if (this.indexMap.has(indexName) == false) {
        this.indexMap.set(indexName , new Map());
    }
}

SplunkMetaData.prototype.addSourceType = function(indexName, sourceTypeName) {
    if (this.indexMap.has(indexName) == false) {
        this.indexMap.set(indexName , new Map());
    }
    if (this.indexMap.get(indexName).has(sourceTypeName) == false) {
        this.indexMap.get(indexName).set(sourceTypeName, new Set());
    }
}

SplunkMetaData.prototype.addFieldName = function(indexName, sourceTypeName, fieldName) {
    if (this.indexMap.has(indexName) == false) {
        this.indexMap.set(indexName , new Map());
    }
    if (this.indexMap.get(indexName).has(sourceTypeName) == false) {
        this.indexMap.get(indexName).set(sourceTypeName, new Set());
    }
    this.indexMap.get(indexName).get(sourceTypeName).add(fieldName);
}
// config.js
const CONFIG = {
    apiDomain: 'https://120.26.103.83:8880',
    
    MINGDAO_API: {
        appKey: 'a0d4aa1144e6941d',
        sign: 'NTRkMWI0OTNiNjVkNDNlYjE2NjRkOGFmMWY2ZDU5MDNmZDViM2ViMWU5YmZkNWQzODc2MWZhNjcxZWMzY2JmMw==',
        
        // 新增：采购订单的FormID
        salesFormId: '695488c5db7e2c372ffdb0db',
        productionFormId: '695cc7b1db7e2c372ffe0251',
        purchaseFormId: '695488c5db7e2c372ffdb0bb', // 新增：采购订单表的FormID
        feedFormId: '695488c5db7e2c372ffdb06b',
        receiptFormId: '695488c5db7e2c372ffdb0a1',
        batchFormId: '695488c5db7e2c372ffdb06e',
        deliveryFormId: '695488c5db7e2c372ffdb0d9',
        
        // 新增：采购订单关联销售订单的字段
        linkFields: {
            productionToSales: '691ec089e64a5fc7cc2241ed',
            purchaseToSales: '691fe1f66267490bf61108a8', // 新增：采购订单关联销售订单的字段
            feedToProduction: '695f1d75db7e2c372ffe12c7',
            receiptToFeed: '6971d3bbdb7e2c372ffee179',
            batchToReceipt: '成品批次关联完工记录的字段标识',
            deliveryToBatch: '发货单关联成品批次的字段标识'
        }
    },
    
    DEBUG: false,
    CHART_THEME: {
        primaryColor: '#409EFF',
        secondaryColor: '#E6A23C',
        successColor: '#67C23A',
        warningColor: '#E6A23C',
        dangerColor: '#F56C6C',
        infoColor: '#909399'
    }
};

// 示例数据（新增采购订单）
const SAMPLE_DATA = {
    销售订单: {订单号: "WXYHY2602000005", 客户: "XX纺织公司", 金额: 150000, _id: "sales-123"},
    生产订单: [{生产订单号: "10000080", 产品: "260103-R3 YY墨盒", 计划数量: 30000, 实际数量: 19100, _id: "prod-123"}],
    采购订单: [{采购订单号: "CG001-2026", 供应商: "XX材料厂", 采购数量: 50000, 状态: "已下单", _id: "pur-123"}], // 新增采购订单
    投料记录: [{缸号: "001", 投料数量: 10000, 批次: "PB001", 状态: "已投料", _id: "feed-123"}],
    完工记录: [{缸号: "001", 正品: 9500, 次品: 400, 制成率: 99, _id: "receipt-123"}],
    成品批次: [{批次号: "CP001-正品", 数量: 9500, 质量: "正品", _id: "batch-123"}],
    发货单: [{发货单号: "SH001", 数量: 8000, 状态: "已发货", _id: "del-123"}]
};

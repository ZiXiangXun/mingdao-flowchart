// ========================================
// 主应用逻辑
// ========================================

const app = {
    // 当前记录ID（从URL参数获取）
    recordId: null,
    
    // 初始化
    async init() {
        console.log('🚀 应用初始化...');
        
        // 从URL获取参数
        const urlParams = new URLSearchParams(window.location.search);
        this.recordId = urlParams.get('recordId');
        
        console.log('📝 记录ID:', this.recordId);
        
        // 初始化Mermaid
        this.initMermaid();
        
        // 加载数据
        await this.loadData();
    },
    
    // 初始化Mermaid
    initMermaid() {
        mermaid.initialize({
            startOnLoad: false,
            theme: 'default',
            themeVariables: {
                primaryColor: CONFIG.CHART_THEME.primaryColor,
                primaryTextColor: '#fff',
                primaryBorderColor: '#337ecc',
                lineColor: '#606266',
                secondaryColor: CONFIG.CHART_THEME.secondaryColor,
                tertiaryColor: CONFIG.CHART_THEME.successColor
            },
            flowchart: {
                useMaxWidth: false,
                htmlLabels: true,
                curve: 'basis',
                padding: 20
            },
            securityLevel: 'loose'
        });
        console.log('✅ Mermaid初始化完成');
    },
    
    // 加载数据
    async loadData() {
        try {
            this.showLoading();
            
            console.log('📥 开始加载数据...');
            
            // 获取数据
            const data = await this.fetchData();
            
            console.log('✅ 数据加载成功:', data);
            
            // 生成流程图
            await this.renderChart(data);
            
            this.hideLoading();
            
        } catch (error) {
            console.error('❌ 加载失败:', error);
            this.showError('加载失败: ' + error.message);
        }
    },
    
    // 获取数据
    async fetchData() {
        // 如果是调试模式，使用示例数据
        if (CONFIG.DEBUG) {
            console.log('🔧 调试模式：使用示例数据');
            await this.sleep(500); // 模拟网络延迟
            return SAMPLE_DATA;
        }
        
        // ==========================================
        // 【重点】调用明道云Webhook获取数据
        // ==========================================
        
        if (!CONFIG.MINGDAO_WEBHOOK_URL || CONFIG.MINGDAO_WEBHOOK_URL === 'YOUR_WEBHOOK_URL_HERE') {
            throw new Error('请在config.js中配置MINGDAO_WEBHOOK_URL');
        }
        
        try {
            const response = await fetch(CONFIG.MINGDAO_WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    recordId: this.recordId
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            return data;
            
        } catch (error) {
            console.error('❌ API调用失败:', error);
            throw new Error('无法连接到明道云: ' + error.message);
        }
    },
    
    // 渲染流程图
    async renderChart(data) {
        console.log('🎨 开始渲染流程图...');
        
        // 生成Mermaid代码
        const mermaidCode = this.generateMermaidCode(data);
        
        console.log('📝 Mermaid代码:\n', mermaidCode);
        
        // 渲染
        const chartElement = document.getElementById('mermaidChart');
        chartElement.innerHTML = '';
        chartElement.textContent = mermaidCode;
        chartElement.removeAttribute('data-processed');
        
        await mermaid.run({
            nodes: [chartElement]
        });
        
        console.log('✅ 流程图渲染完成');
        
        // 显示图表
        document.getElementById('chartContainer').style.display = 'block';
        
        // 添加点击事件
        setTimeout(() => {
            this.addNodeClickEvents();
        }, 500);
    },
    
    // 生成Mermaid代码
    generateMermaidCode(data) {
        let code = "graph LR\n";
        
        // 销售订单节点
        code += `    SO["📋 销售订单<br/>${data.销售订单.订单号}<br/>${data.销售订单.客户}<br/>💰 ${data.销售订单.金额.toLocaleString()}元"]\n`;
        
        // 生产订单节点
        data.生产订单.forEach((mo, i) => {
            const moId = `MO${i}`;
            code += `    SO --> ${moId}["🏭 生产订单<br/>${mo.生产订单号}<br/>${mo.产品}<br/>📊 ${mo.实际数量}/${mo.计划数量}米"]\n`;
            
            // 投料节点
            data.投料记录.forEach((issue, j) => {
                const issueId = `Issue${i}_${j}`;
                const 状态图标 = issue.状态 === "已投料" ? "✅" : "⏳";
                code += `    ${moId} --> ${issueId}["📦 投料-${issue.缸号}<br/>${状态图标} ${issue.投料数量}米<br/>批次:${issue.批次}"]\n`;
                
                // 完工节点
                const 完工 = data.完工记录.find(r => r.缸号 === issue.缸号);
                if (完工) {
                    const receiptId = `Receipt${i}_${j}`;
                    code += `    ${issueId} --> ${receiptId}["✅ 完工-${完工.缸号}<br/>正品:${完工.正品}米<br/>次品:${完工.次品}米<br/>制成率:${完工.制成率}%"]\n`;
                    
                    // 成品批次节点
                    const 批次序号 = 完工.缸号.padStart(3, '0');
                    const 批次列表 = data.成品批次.filter(b => b.批次号.includes(批次序号));
                    批次列表.forEach((batch, k) => {
                        const batchId = `Batch${i}_${j}_${k}`;
                        const 图标 = batch.质量 === "正品" ? "✨" : "⚠️";
                        code += `    ${receiptId} --> ${batchId}["${图标} ${batch.批次号}<br/>${batch.数量}米"]\n`;
                    });
                }
            });
        });
        
        // 发货单节点
        data.发货单.forEach((delivery, i) => {
            const deliveryId = `Delivery${i}`;
            const 状态图标 = delivery.状态 === "已发货" ? "✅" : "⏳";
            code += `    Batch0_0_0 --> ${deliveryId}["🚚 ${delivery.发货单号}<br/>${状态图标} ${delivery.数量}米"]\n`;
            if (i === 0 && data.成品批次.length > 2) {
                code += `    Batch0_1_0 --> ${deliveryId}\n`;
            }
        });
        
        // 样式
        code += `\n    classDef salesOrder fill:#409EFF,stroke:#337ecc,stroke-width:2px,color:#fff\n`;
        code += `    classDef production fill:#E6A23C,stroke:#cf9236,stroke-width:2px,color:#fff\n`;
        code += `    classDef completed fill:#67C23A,stroke:#5daf34,stroke-width:2px,color:#fff\n`;
        code += `    classDef pending fill:#909399,stroke:#82848a,stroke-width:2px,color:#fff\n`;
        code += `\n    class SO salesOrder\n`;
        code += `    class MO0 production\n`;
        
        return code;
    },
    
    // 添加节点点击事件
    addNodeClickEvents() {
        const nodes = document.querySelectorAll('.node');
        console.log('🖱️ 添加点击事件，节点数量:', nodes.length);
        nodes.forEach(node => {
            node.style.cursor = 'pointer';
            node.addEventListener('click', function(e) {
                e.stopPropagation();
                const label = this.textContent || '';
                if (label) {
                    alert('点击了节点:\n' + label.trim() + '\n\n💡 在明道云中可以配置跳转到对应记录');
                }
            });
        });
    },
    
    // 刷新数据
    async refresh() {
        console.log('🔄 刷新数据...');
        await this.loadData();
    },
    
    // 导出图片
    exportImage() {
        try {
            const svg = document.querySelector('.mermaid svg');
            if (!svg) {
                alert('没有找到图表');
                return;
            }
            
            const svgData = new XMLSerializer().serializeToString(svg);
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = function() {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
                
                canvas.toBlob(function(blob) {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = '业务流程图_' + new Date().getTime() + '.png';
                    a.click();
                    URL.revokeObjectURL(url);
                });
            };
            
            img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
            
        } catch (error) {
            console.error('导出失败:', error);
            alert('导出失败: ' + error.message);
        }
    },
    
    // 返回
    goBack() {
        if (window.opener) {
            window.close();
        } else if (window.history.length > 1) {
            window.history.back();
        } else {
            alert('请关闭此窗口返回明道云');
        }
    },
    
    // 显示加载中
    showLoading() {
        document.getElementById('loading').style.display = 'block';
        document.getElementById('error').style.display = 'none';
        document.getElementById('chartContainer').style.display = 'none';
    },
    
    // 隐藏加载中
    hideLoading() {
        document.getElementById('loading').style.display = 'none';
    },
    
    // 显示错误
    showError(message) {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('error').style.display = 'block';
        document.getElementById('chartContainer').style.display = 'none';
        document.getElementById('errorMessage').textContent = message;
    },
    
    // 工具函数：延迟
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM加载完成');
    app.init();
});

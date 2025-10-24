// 醒狮陪伴应用 - 主要JavaScript逻辑

class LionCompanion {
    constructor() {
        this.intimacy = parseInt(localStorage.getItem('intimacy')) || 0;
        this.lastFeedDate = localStorage.getItem('lastFeedDate') || '';
        this.conversationCount = parseInt(localStorage.getItem('conversationCount')) || 0;
        this.petCount = parseInt(localStorage.getItem('petCount')) || 0;
        this.lastChatBubbleTime = 0;
        
        this.init();
    }
    
    init() {
        this.updateUI();
        this.startIdleAnimation();
        this.bindEvents();
        this.checkDailyStatus();
        this.scheduleChatBubble();
    }
    
    updateUI() {
        // 更新亲密度显示
        document.getElementById('intimacyLevel').textContent = this.intimacy;
        
        // 更新木棉花状态
        const kapokIcon = document.getElementById('kapokIcon');
        kapokIcon.classList.remove('blooming');
        
        if (this.intimacy >= 50) {
            kapokIcon.classList.add('blooming');
        }
        
        // 更新喂食按钮状态
        const today = new Date().toDateString();
        const feedBtn = document.getElementById('dailyFeedBtn');
        if (this.lastFeedDate === today) {
            feedBtn.disabled = true;
            feedBtn.textContent = '已喂食';
        } else {
            feedBtn.disabled = false;
            feedBtn.textContent = '每日喂食';
        }
    }
    
    bindEvents() {
        // 触摸区域事件
        const touchAreas = document.querySelectorAll('.touch-area');
        touchAreas.forEach(area => {
            area.addEventListener('click', (e) => {
                e.stopPropagation();
                this.petLion(area.dataset.area);
            });
        });
        
        // 喂食按钮事件
        document.getElementById('dailyFeedBtn').addEventListener('click', () => {
            this.showFeedModal();
        });
        
        // 喂食选择事件
        document.querySelectorAll('.silk-ball-option').forEach(option => {
            option.addEventListener('click', () => {
                this.feedLion(option.dataset.type);
            });
        });
        
        // 对话气泡事件
        document.getElementById('chatBubble').addEventListener('click', () => {
            window.location.href = 'chat.html';
        });
        
        // 点击空白处关闭弹窗
        document.getElementById('feedModal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.closeFeedModal();
            }
        });
    }
    
    petLion(area) {
        const lion = document.getElementById('lionCharacter');
        
        // 添加抚摸动画
        lion.classList.add('petting');
        setTimeout(() => {
            lion.classList.remove('petting');
        }, 500);
        
        // 创建爱心粒子
        this.createHeartParticle(area);
        
        // 增加亲密度
        this.intimacy += 1;
        this.petCount += 1;
        this.saveData();
        this.updateUI();
        
        // 播放反馈动画
        this.showPetFeedback(area);
    }
    
    createHeartParticle(area) {
        const heart = document.createElement('div');
        heart.className = 'heart-particle';
        heart.innerHTML = '💖';
        
        const lion = document.getElementById('lionCharacter');
        const rect = lion.getBoundingClientRect();
        
        // 根据触摸区域调整位置
        let leftOffset = 140;
        let topOffset = 150;
        
        switch(area) {
            case 'head':
                leftOffset = 140;
                topOffset = 120;
                break;
            case 'back':
                leftOffset = 140;
                topOffset = 180;
                break;
            case 'chin':
                leftOffset = 140;
                topOffset = 220;
                break;
        }
        
        heart.style.left = leftOffset + 'px';
        heart.style.top = topOffset + 'px';
        
        lion.appendChild(heart);
        
        // 2秒后移除
        setTimeout(() => {
            if (heart.parentNode) {
                heart.parentNode.removeChild(heart);
            }
        }, 2000);
    }
    
    showPetFeedback(area) {
        // 根据触摸区域显示不同的反馈
        const messages = {
            head: ['好舒服～', '最喜欢被摸头了！', '嘿嘿，好痒呀～'],
            back: ['嗯～好舒服', '背部按摩最棒了！', '好温暖的感觉～'],
            chin: ['哈哈，好痒！', '下巴最舒服了～', '好享受呀！']
        };
        
        const message = messages[area][Math.floor(Math.random() * messages[area].length)];
        this.showTemporaryMessage(message);
    }
    
    showTemporaryMessage(message) {
        const bubble = document.getElementById('chatBubble');
        const originalText = bubble.textContent;
        
        bubble.textContent = message;
        bubble.classList.add('show');
        
        setTimeout(() => {
            bubble.textContent = originalText;
            bubble.classList.remove('show');
        }, 3000);
    }
    
    showFeedModal() {
        const modal = document.getElementById('feedModal');
        modal.style.display = 'flex';
        
        // 动画显示
        anime({
            targets: '.feed-content',
            scale: [0.8, 1],
            opacity: [0, 1],
            duration: 300,
            easing: 'easeOutBack'
        });
    }
    
    closeFeedModal() {
        const modal = document.getElementById('feedModal');
        
        anime({
            targets: '.feed-content',
            scale: [1, 0.8],
            opacity: [1, 0],
            duration: 200,
            easing: 'easeInBack',
            complete: () => {
                modal.style.display = 'none';
            }
        });
    }
    
    feedLion(ballType) {
        const today = new Date().toDateString();
        
        if (this.lastFeedDate === today) {
            this.showTemporaryMessage('今天已经喂过啦，明天再来吧～');
            this.closeFeedModal();
            return;
        }
        
        // 播放喂食动画
        this.playFeedAnimation(ballType);
        
        // 更新数据
        this.lastFeedDate = today;
        this.intimacy += 5;
        this.saveData();
        this.updateUI();
        
        // 显示感谢消息
        const thanksMessages = {
            courage: '勇气绣球真好吃！我感觉充满了力量！',
            wisdom: '智慧绣球的味道好特别，我感觉变聪明了！',
            peace: '平安绣球让我感到很安心，谢谢你！',
            happiness: '快乐绣球好甜呀！我要开心地跳舞啦！'
        };
        
        this.showTemporaryMessage(thanksMessages[ballType]);
        this.closeFeedModal();
        
        // 记录喂食历史
        this.addFeedHistory(ballType);
    }
    
    playFeedAnimation(ballType) {
        const lion = document.getElementById('lionCharacter');
        
        // 创建绣球元素
        const ball = document.createElement('div');
        ball.style.position = 'absolute';
        ball.style.width = '40px';
        ball.style.height = '40px';
        ball.style.background = this.getBallColor(ballType);
        ball.style.borderRadius = '50%';
        ball.style.top = '-50px';
        ball.style.left = '120px';
        ball.style.zIndex = '10';
        
        lion.appendChild(ball);
        
        // 绣球掉落动画
        anime({
            targets: ball,
            translateY: [0, 200],
            rotate: [0, 360],
            duration: 1000,
            easing: 'easeInQuad',
            complete: () => {
                // 狮子接住动画
                anime({
                    targets: lion,
                    scale: [1, 1.1, 1],
                    duration: 500,
                    easing: 'easeOutBounce'
                });
                
                // 移除绣球
                setTimeout(() => {
                    if (ball.parentNode) {
                        ball.parentNode.removeChild(ball);
                    }
                }, 500);
            }
        });
        
        // 光效动画
        this.createFeedEffect();
    }
    
    getBallColor(type) {
        const colors = {
            courage: 'linear-gradient(45deg, #FF6347, #FF8C69)',
            wisdom: 'linear-gradient(45deg, #4169E1, #87CEEB)',
            peace: 'linear-gradient(45deg, #32CD32, #98FB98)',
            happiness: 'linear-gradient(45deg, #FFD700, #FFFF00)'
        };
        return colors[type];
    }
    
    createFeedEffect() {
        // 创建光效粒子
        for (let i = 0; i < 10; i++) {
            const particle = document.createElement('div');
            particle.style.position = 'absolute';
            particle.style.width = '8px';
            particle.style.height = '8px';
            particle.style.background = '#FFD700';
            particle.style.borderRadius = '50%';
            particle.style.top = '150px';
            particle.style.left = '140px';
            particle.style.pointerEvents = 'none';
            
            document.getElementById('lionCharacter').appendChild(particle);
            
            anime({
                targets: particle,
                translateX: (Math.random() - 0.5) * 200,
                translateY: (Math.random() - 0.5) * 200,
                scale: [1, 0],
                opacity: [1, 0],
                duration: 1500,
                delay: i * 100,
                easing: 'easeOutQuad',
                complete: () => {
                    if (particle.parentNode) {
                        particle.parentNode.removeChild(particle);
                    }
                }
            });
        }
    }
    
    startIdleAnimation() {
        // 呼吸动画
        anime({
            targets: '#lionCharacter',
            scale: [1, 1.02, 1],
            duration: 3000,
            loop: true,
            easing: 'easeInOutSine'
        });
        
        // 随机眨眼
        setInterval(() => {
            if (Math.random() < 0.3) {
                this.blink();
            }
        }, 5000);
        
        // 随机耳朵抖动
        setInterval(() => {
            if (Math.random() < 0.2) {
                this.wiggleEars();
            }
        }, 8000);
    }
    
    blink() {
        // 眨眼动画（通过CSS滤镜模拟）
        const lion = document.getElementById('lionCharacter');
        lion.style.filter = 'brightness(0.8)';
        setTimeout(() => {
            lion.style.filter = 'brightness(1)';
        }, 200);
    }
    
    wiggleEars() {
        // 耳朵抖动动画
        const lion = document.getElementById('lionCharacter');
        anime({
            targets: lion,
            rotateZ: [-2, 2, -2, 0],
            duration: 500,
            easing: 'easeInOutSine'
        });
    }
    
    scheduleChatBubble() {
        // 定期显示对话气泡
        setInterval(() => {
            const now = Date.now();
            if (now - this.lastChatBubbleTime > 30000) { // 30秒一次
                this.showRandomChatBubble();
                this.lastChatBubbleTime = now;
            }
        }, 30000);
    }
    
    showRandomChatBubble() {
        const messages = [
            '想和我聊聊天吗？',
            '今天天气真好呢～',
            '我学会新的舞蹈了！',
            '主人，陪我玩一会儿吧～',
            '我有点饿了...',
            '今天也要加油哦！',
            '我给你讲个故事吧？',
            '摸摸我的头吧～'
        ];
        
        const message = messages[Math.floor(Math.random() * messages.length)];
        const bubble = document.getElementById('chatBubble');
        
        bubble.textContent = message;
        bubble.classList.add('show');
        
        // 5秒后隐藏
        setTimeout(() => {
            bubble.classList.remove('show');
        }, 5000);
    }
    
    checkDailyStatus() {
        // 检查是否需要重置每日状态
        const today = new Date().toDateString();
        const lastVisit = localStorage.getItem('lastVisitDate');
        
        if (lastVisit !== today) {
            // 新的一天，重置状态
            localStorage.setItem('lastVisitDate', today);
            
            // 如果超过一天没访问，显示想念消息
            if (lastVisit && this.isNewDay(lastVisit, today)) {
                setTimeout(() => {
                    this.showTemporaryMessage('你终于回来了！我好想你呀～');
                }, 2000);
            }
        }
    }
    
    isNewDay(lastDate, currentDate) {
        const last = new Date(lastDate);
        const current = new Date(currentDate);
        const diffTime = Math.abs(current - last);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 1;
    }
    
    addFeedHistory(ballType) {
        const history = JSON.parse(localStorage.getItem('feedHistory')) || [];
        history.push({
            type: ballType,
            date: new Date().toISOString(),
            intimacy: this.intimacy
        });
        localStorage.setItem('feedHistory', JSON.stringify(history));
    }
    
    saveData() {
        localStorage.setItem('intimacy', this.intimacy.toString());
        localStorage.setItem('lastFeedDate', this.lastFeedDate);
        localStorage.setItem('conversationCount', this.conversationCount.toString());
        localStorage.setItem('petCount', this.petCount.toString());
    }
    
    // 公共方法，供其他页面调用
    static getInstance() {
        if (!window.lionCompanion) {
            window.lionCompanion = new LionCompanion();
        }
        return window.lionCompanion;
    }
}

// 全局函数
function closeFeedModal() {
    window.lionCompanion.closeFeedModal();
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    LionCompanion.getInstance();
});

// 导出给其他页面使用
window.LionCompanion = LionCompanion;
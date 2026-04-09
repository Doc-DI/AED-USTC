// AED引导应用主逻辑

let currentCampus = null;
let currentBuilding = null;

// 初始化
function init() {
    renderCampusList();
}

// 渲染校区列表
function renderCampusList() {
    const campusList = document.getElementById('campus-list');
    campusList.innerHTML = '';
    
    Object.keys(aedData).forEach(campusName => {
        const campusItem = document.createElement('div');
        campusItem.className = 'campus-item';
        campusItem.onclick = () => selectCampus(campusName);
        
        const buildingCount = aedData[campusName].buildings.length;
        
        campusItem.innerHTML = `
            <span class="name">${campusName}</span>
            <span class="arrow">→</span>
        `;
        
        campusList.appendChild(campusItem);
    });
}

// 选择校区
function selectCampus(campusName) {
    currentCampus = campusName;
    document.getElementById('current-campus-name').textContent = campusName;
    renderBuildingList();
    showPage('building-page');
}

// 渲染楼宇列表
function renderBuildingList() {
    const buildingList = document.getElementById('building-list');
    buildingList.innerHTML = '';
    
    const buildings = aedData[currentCampus].buildings;
    
    // 按名称排序
    buildings.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
    
    buildings.forEach(building => {
        const buildingItem = document.createElement('div');
        buildingItem.className = `building-item ${building.hasAED ? 'has-aed' : 'no-aed'}`;
        buildingItem.onclick = () => selectBuilding(building);
        
        const statusText = building.hasAED ? '本楼有AED' : '本楼无AED';
        const statusClass = building.hasAED ? 'has' : 'none';
        
        buildingItem.innerHTML = `
            <div class="info">
                <div class="name">${building.name}</div>
                <span class="status ${statusClass}">${statusText}</span>
            </div>
            <span class="arrow">›</span>
        `;
        
        buildingList.appendChild(buildingItem);
    });
}

// 选择楼宇
function selectBuilding(building) {
    currentBuilding = building;
    renderGuidePage();
    showPage('guide-page');
}

// 渲染引导页面
function renderGuidePage() {
    const guideContent = document.getElementById('guide-content');
    
    const imageBasePath = `${campusConfig.imageBasePath}/${currentCampus}/${currentBuilding.name}`;
    
    let html = '';
    
    // AED状态提示
    if (currentBuilding.hasAED) {
        html += `
            <div class="aed-status has">
                <span class="icon">✅</span>
                <span>${currentBuilding.name} 配备AED设备</span>
            </div>
        `;
    } else {
        html += `
            <div class="aed-status none">
                <span class="icon">⚠️</span>
                <span>${currentBuilding.name} 未配备AED设备</span>
            </div>
        `;
    }
    
    // 路线描述
    html += `
        <div class="card">
            <div class="guide-section">
                <div class="guide-title">
                    <span>${currentBuilding.hasAED ? '📝' : '🏃'}</span>
                    ${currentBuilding.hasAED ? '位置指引' : '前往最近AED'}
                </div>
                <div class="guide-content ${currentBuilding.hasAED ? '' : 'highlight'}">
                    ${currentBuilding.description}
                </div>
            </div>
        </div>
    `;
    
    // 如果本楼没有AED，显示推荐的AED楼宇信息
    if (!currentBuilding.hasAED && currentBuilding.nearestAED) {
        const nearestBuilding = findBuilding(currentBuilding.nearestAED);
        if (nearestBuilding) {
            const distance = currentBuilding.distance || "";
            html += `
                <div class="card" style="border: 2px solid #28a745;">
                    <div class="guide-section">
                        <div class="guide-title">
                            <span>🏥</span>
                            推荐前往 ${currentBuilding.nearestAED}
                            ${distance ? `<span style="font-size: 14px; color: #666; margin-left: 10px;">${distance}</span>` : ''}
                        </div>
                        <div class="guide-content">
                            <p><strong>AED位置描述：</strong></p>
                            <p style="margin-top: 8px;">${nearestBuilding.description}</p>
                        </div>
                    </div>
                </div>
            `;
            
            // 显示最近楼宇的图片（如果有）
            if (nearestBuilding.images && nearestBuilding.images.length > 0) {
                const nearestImageBasePath = `${campusConfig.imageBasePath}/${currentCampus}/${nearestBuilding.name}`;
                html += `
                    <div class="card">
                        <div class="guide-section">
                            <div class="guide-title">
                                <span>📷</span>
                                ${nearestBuilding.name} 引导图片
                            </div>
                            <div class="image-gallery">
                `;
                
                nearestBuilding.images.forEach((imageName, index) => {
                    html += `
                        <div class="image-item">
                            <div class="step-number">步骤 ${index + 1}</div>
                            <img src="${nearestImageBasePath}/${imageName}" 
                                 alt="步骤 ${index + 1}" 
                                 onerror="this.parentElement.innerHTML='<div class=\'no-image-placeholder\'>图片加载失败</div>'">
                        </div>
                    `;
                });
                
                html += `
                            </div>
                        </div>
                    </div>
                `;
            }
        }
    }
    
    // 本楼图片展示（只有有AED的楼才显示本楼图片）
    if (currentBuilding.hasAED) {
        if (currentBuilding.images && currentBuilding.images.length > 0) {
            html += `
                <div class="card">
                    <div class="guide-section">
                        <div class="guide-title">
                            <span>📷</span>
                            引导图片
                        </div>
                        <div class="image-gallery">
            `;
            
            currentBuilding.images.forEach((imageName, index) => {
                html += `
                    <div class="image-item">
                        <div class="step-number">步骤 ${index + 1}</div>
                        <img src="${imageBasePath}/${imageName}" 
                             alt="步骤 ${index + 1}" 
                             onerror="this.parentElement.innerHTML='<div class=\'no-image-placeholder\'>图片加载失败</div>'">
                    </div>
                `;
            });
            
            html += `
                        </div>
                    </div>
                </div>
            `;
        } else {
            html += `
                <div class="card">
                    <div class="no-image-placeholder">
                        <div style="font-size: 48px; margin-bottom: 10px;">📷</div>
                        <div>引导图片正在收集中...</div>
                    </div>
                </div>
            `;
        }
    }
    
    // 紧急提示
    html += `
        <div class="card" style="background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%); border: 2px solid #ef5350;">
            <div style="text-align: center; padding: 10px;">
                <div style="font-size: 24px; margin-bottom: 10px;">🚨</div>
                <div style="font-size: 16px; font-weight: 600; color: #c62828; margin-bottom: 8px;">
                    紧急情况处理提示
                </div>
                <div style="font-size: 14px; color: #d32f2f; line-height: 1.6;">
                    1. 立即拨打 120 急救电话<br>
                    2. 同时取AED并开始心肺复苏<br>
                    3. AED到达后立即使用<br>
                    4. 听从AED语音提示操作
                </div>
            </div>
        </div>
    `;
    
    guideContent.innerHTML = html;
}

// 查找楼宇
function findBuilding(buildingName) {
    const buildings = aedData[currentCampus].buildings;
    return buildings.find(b => b.name === buildingName);
}

// 页面切换
function showPage(pageId) {
    // 隐藏所有页面
    document.querySelectorAll('.page').forEach(page => {
        page.classList.add('hidden');
    });
    
    // 显示目标页面
    const targetPage = document.getElementById(pageId);
    targetPage.classList.remove('hidden');
    targetPage.classList.add('fade-in');
    
    // 滚动到顶部
    window.scrollTo(0, 0);
}

// 显示校区选择页面
function showCampusPage() {
    currentCampus = null;
    currentBuilding = null;
    showPage('campus-page');
}

// 显示楼宇选择页面
function showBuildingPage() {
    currentBuilding = null;
    showPage('building-page');
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);

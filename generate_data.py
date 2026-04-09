import pandas as pd
import json
import os

# 读取Excel
df = pd.read_excel('D:/Desktop/AED引导网页开发/中科大AED引导分工与命名规范表.xlsx')

# 照片基础路径
photo_base_path = 'D:/Desktop/AED引导网页开发/照片'

# 获取楼宇的照片列表
def get_building_images(campus, building_name):
    building_photo_path = os.path.join(photo_base_path, campus, building_name)
    if os.path.exists(building_photo_path):
        # 获取所有jpg文件并排序
        images = sorted([f for f in os.listdir(building_photo_path) if f.lower().endswith('.jpg')])
        return images
    return []

# 按校区分组
aed_data = {}
for campus in df['校区'].unique():
    campus_df = df[df['校区'] == campus]
    buildings = []
    for _, row in campus_df.iterrows():
        has_aed = row['是否有AED'] == '是'
        building = {
            'name': row['楼宇/地点名称'],
            'hasAED': has_aed,
            'description': str(row['位置描述']) if pd.notna(row['位置描述']) else ''
        }
        if not has_aed and pd.notna(row['最近的AED']):
            building['nearestAED'] = row['最近的AED']
        # 扫描实际存在的照片文件
        building['images'] = get_building_images(campus, row['楼宇/地点名称'])
        buildings.append(building)
    aed_data[campus] = {'buildings': buildings}

# 构建JS内容
lines = [
    '// AED数据配置',
    '// 校区和楼宇数据结构',
    '// 此文件由Excel自动生成',
    '',
    'const aedData = ' + json.dumps(aed_data, ensure_ascii=False, indent=4) + ';',
    '',
    '// 校区配置',
    'const campusConfig = {',
    '    imageBasePath: "../照片",',
    '    emergencyPhone: "120",',
    '    campusEmergencyPhone: ""',
    '};',
    ''
]

with open('D:/Desktop/AED引导网页开发/网页/data.js', 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines))

print('File saved successfully!')

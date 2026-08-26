import matplotlib
matplotlib.use('Agg')
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
import numpy as np

plt.rcParams['font.family'] = ['Times New Roman', 'SimSun']
plt.rcParams['axes.unicode_minus'] = False

df = pd.read_csv(r'lishu_season_meteorology_daily_v2.csv', encoding='utf-8')
df['date'] = pd.to_datetime(df['date'])
df['year_cal'] = df['date'].dt.year

spring = df[df['month'].isin([3, 4, 5])].copy()
spring_years = [2019, 2020, 2021, 2022, 2023, 2024]
spring = spring[spring['year_cal'].isin(spring_years)]

fig, ax = plt.subplots(figsize=(12, 6), constrained_layout=True)
colors = plt.cm.viridis(np.linspace(0, 0.9, len(spring_years)))

for i, y in enumerate(spring_years):
    d = spring[spring['year_cal'] == y].sort_values('date')
    x = d['date'].dt.strftime('%m-%d').str.split('-').apply(lambda t: int(t[0]) * 31 + int(t[1]))
    label = f"{y}年春"
    ax.plot(d['date'].dt.strftime('%m-%d'), d['temperature_max'],
            label=label, color=colors[i], linewidth=1.4, alpha=0.9)

ax.set_ylabel('日最高气温 (℃)')
ax.set_title('吉林省梨树县 2019-2024 年春季逐日最高气温曲线')
ax.grid(True, alpha=0.3, linestyle='--')
ax.legend(ncol=3, fontsize=10)

months = ['03-01', '03-15', '04-01', '04-15', '05-01', '05-15', '05-31']
ax.set_xticks(months)
ax.set_xticklabels(['3月1日', '3月15日', '4月1日', '4月15日', '5月1日', '5月15日', '5月31日'])

fig.savefig('lishu_spring_tmax_2019_2024.png', dpi=300, bbox_inches='tight')

for y in spring_years:
    d = spring[spring['year_cal'] == y]['temperature_max']
    print(f"{y}年春: 均值 {d.mean():.1f}℃, 最高 {d.max():.1f}℃, 最低 {d.min():.1f}℃, 天数 {len(d)}")

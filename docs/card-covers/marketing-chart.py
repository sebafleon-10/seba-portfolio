import sys, json, numpy as np, pandas as pd, matplotlib
matplotlib.use('Agg'); import matplotlib.pyplot as plt
from sklearn.linear_model import LogisticRegression
R, D = sys.argv[1], sys.argv[2]
d=pd.read_csv(R+'/data/raw/DoorDash.csv')
X=pd.get_dummies(d[['recency','frequency','monetary','age','device']],drop_first=True).astype(float); y=d.response
rng=np.random.default_rng(3); tr=rng.random(len(d))<.5
p=LogisticRegression(max_iter=2000).fit(X[tr],y[tr]).predict_proba(X[~tr])[:,1]
t=d[~tr].assign(p=p); be=json.load(open(R+'/results/doordash.json'))['breakeven']
no=t[t.response==0].sample(1100,random_state=2); yes=t[t.response==1].sample(450,random_state=2)
jit=np.random.default_rng(5)
def draw(style):
    if style=='night':
        bg,grid,txt,sub='#0e1015','#22252d','#f2f3f5','#8b909c'; cno,cyes,cbe='#55627d','#f2b84b','#9D9FFF'; tf,bf='Avenir Next','Avenir Next'
    else:
        bg,grid,txt,sub='#f5efe3','#ddd3c2','#1d1a16','#6f665a'; cno,cyes,cbe='#b9ab95','#a3263a','#1d1a16'; tf,bf='Georgia','Avenir Next'
    plt.rcParams.update({'font.family':bf})
    f,ax=plt.subplots(figsize=(6.12,3.7),dpi=400); f.patch.set_facecolor(bg); ax.set_facecolor(bg)
    ax.grid(axis='y',color=grid,lw=.8); ax.set_axisbelow(True)
    if style=='night': ax.grid(axis='x',color=grid,lw=.8)
    for s in ['top','right','left']: ax.spines[s].set_visible(False)
    ax.spines['bottom'].set_color(grid); ax.tick_params(colors=sub,labelsize=7,length=0)
    xj=lambda s: s.recency+jit.uniform(-.6,.6,len(s))
    ax.scatter(xj(no),no.p,s=7,c=cno,alpha=.6,lw=0)
    ax.scatter(xj(yes),yes.p,s=8,c=cyes,alpha=.85,lw=0)
    for v,c,w in [(0,cno,2.2),(1,cyes,2.6)]:
        s=t[t.response==v]; b=np.polyfit(s.recency,s.p,2); xs=np.linspace(s.recency.quantile(.01),s.recency.quantile(.985),40); ax.plot(xs,np.polyval(b,xs),c=c,lw=w)
    ax.axhline(be,color=cbe,lw=1,ls=(0,(4,3)))
    ax.text(178,be+.004,f'Breakeven {be*100:.1f}%',ha='right',va='bottom',fontsize=7,color=cbe)
    ax.set_xlim(0,182); ax.set_ylim(0,.25)
    ax.yaxis.set_major_formatter(matplotlib.ticker.PercentFormatter(1.0,decimals=0))
    ax.set_xlabel('Days since last order',fontsize=7.5,color=sub,labelpad=4)
    f.text(.055,.93,'Who Gets the Push?',fontsize=13.5,fontweight='bold',color=txt,family=tf,va='top')
    f.text(.055,.845,'Predicted chance each customer orders after a free-delivery push',fontsize=7.5,color=sub,va='top')
    f.text(.055+0.0,.78,'●',fontsize=8,color=cyes,va='top',family='Arial Unicode MS'); f.text(.075,.78,'Ordered',fontsize=7,color=txt,va='top')
    f.text(.17,.78,'●',fontsize=8,color=cno,va='top',family='Arial Unicode MS'); f.text(.19,.78,'Did not order',fontsize=7,color=txt,va='top')
    f.subplots_adjust(left=.075,right=.975,top=.72,bottom=.14)
    f.savefig(f'{D}/mkt-{style}.png',facecolor=bg)
draw('night'); draw('cream')

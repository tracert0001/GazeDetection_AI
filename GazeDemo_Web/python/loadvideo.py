import sys, json
import os
import pytube
import sys

dwn_link=''
for line in sys.stdin:
    if not line:
        break
    else: 
        dwn_link=json.loads(line)

os_getcwd=os.getcwd() # C:\Users\Student\Desktop\website1029
download_path=os_getcwd+'\public\\video_'
url=dwn_link['Url']
videoid=dwn_link['vid']
vlen=dwn_link['vlen']
mp4='.mp4'
print(videoid)

# === download video from youtube ===#
youtube=pytube.YouTube(url)
# 看mp4的streams有哪些:
#mp4streams=youtube.streams.filter(subtype='mp4').all()
#print(len(mp4streams)) 
youtube=youtube.streams.get_by_itag(22) 
youtube.download(download_path,mp4,'dwn_'+str(videoid))
print('download complete')

# === 剪影片=> 10秒/25fps ===#
os.system("ffmpeg -i {d_path}/dwn_{vid}{mp4} -vf fps=fps=25 -ss {start} -t {end} {d_path}/{vid}{mp4}".format(d_path=download_path,start=0,end=vlen,vid=videoid,mp4=mp4))
print('10s refps complete')

# === 執行 track.py ===#
os.chdir(os.path.dirname(__file__))
os.system("python track.py --source ../public/video_/{vid}{mp4} --save-txt --save-vid --evaluate --output ../public/video_tracked --device 0".format(vid=videoid,mp4=mp4))
print('tracking complete')

if __name__ == '__main__':
    pass
# toascii.ImageConverter(filename: str, scale: float, width_stretch: float, gradient: str)
import toascii
from tkinter import filedialog as fd
file_name = fd.askopenfilename(filetypes=(("mp4", "*.mp4"),
                   ("Прочие файлы", "*.*")))
print(file_name)
f = open('frames.txt','w')
text1 = ""
gradient = " .:!+*e$@8"
text = toascii.VideoConverter(file_name, .07, 2, gradient).convert().ascii_frames
# text1.join(text)
res = ' '.join([":frame:\n"+str(item) for item in text]) 
# print(res)
f.write(res)
print("Сохранено")
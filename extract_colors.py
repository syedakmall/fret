import sys
from PIL import Image

def get_colors(img_path):
    img = Image.open(img_path).convert('RGB')
    width, height = img.size
    colors = []
    x = width // 2
    for y in range(0, height, height//20):
        r, g, b = img.getpixel((x, y))
        hex_color = f"#{r:02x}{g:02x}{b:02x}"
        if not colors or colors[-1] != hex_color:
            colors.append(hex_color)
    print("Found colors down the center:", colors)

get_colors("/var/folders/hj/tt_k_4713blbs8g1np4d9y5w0000gn/T/TemporaryItems/NSIRD_screencaptureui_RQ4Dor/Screenshot 2026-08-30 at 15.50.23.png")

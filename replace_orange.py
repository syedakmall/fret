import os
import glob
import re

files = glob.glob("components/**/*.tsx", recursive=True) + glob.glob("app/**/*.tsx", recursive=True)

for filepath in files:
    with open(filepath, "r") as f:
        content = f.read()

    # Replace orange variants with sage variants
    content = re.sub(r'bg-orange-500', 'bg-sage-strong', content)
    content = re.sub(r'border-orange-500', 'border-sage-strong', content)
    content = re.sub(r'text-orange-500', 'text-sage-strong', content)
    content = re.sub(r'ring-orange-500', 'ring-sage-strong', content)
    content = re.sub(r'accent-orange-500', 'accent-sage-strong', content)

    content = re.sub(r'bg-orange-600', 'bg-ink', content)
    content = re.sub(r'border-orange-600', 'border-ink', content)
    content = re.sub(r'text-orange-600', 'text-ink', content)
    
    content = re.sub(r'text-orange-700', 'text-ink', content)
    
    content = re.sub(r'bg-orange-50/50', 'bg-sage-soft/30', content)

    with open(filepath, "w") as f:
        f.write(content)

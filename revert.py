import os
import glob
import re

files = glob.glob("components/**/*.tsx", recursive=True) + glob.glob("app/**/*.tsx", recursive=True)

for filepath in files:
    with open(filepath, "r") as f:
        content = f.read()

    # Revert sage-strong to orange-500
    content = re.sub(r'bg-sage-strong', 'bg-orange-500', content)
    content = re.sub(r'border-sage-strong', 'border-orange-500', content)
    content = re.sub(r'text-sage-strong', 'text-orange-500', content)
    content = re.sub(r'ring-sage-strong', 'ring-orange-500', content)
    content = re.sub(r'accent-sage-strong', 'accent-orange-500', content)

    # Revert specific known hover/active ink states back to orange-600/700
    content = content.replace("hover:bg-ink", "hover:bg-orange-600")
    
    # Toggle handle text active state
    content = content.replace("text-ink group-hover:text-ink", "text-orange-700 group-hover:text-orange-700")
    content = content.replace("checked ? 'text-ink'", "checked ? 'text-orange-700'")
    content = content.replace("checked ? 'text-ink/80'", "checked ? 'text-orange-600/80'")
    
    # StepBar text-ink
    content = content.replace("text-ink shadow-sm", "text-orange-700 shadow-sm")
    content = content.replace("text-ink/70", "text-orange-600/70")
    
    # ui.tsx tabs ring
    content = content.replace("ring-sage-strong/20", "ring-orange-500/20")
    
    # Woodpicker
    content = content.replace("selected ? 'text-ink'", "selected ? 'text-orange-700'")
    
    # ui.tsx segmented
    content = content.replace("selected ? 'bg-surface text-ink shadow-sm ring-1 ring-black/5'", "selected ? 'bg-surface text-orange-600 shadow-sm ring-1 ring-black/5'")

    # Revert bg-sage-soft/30 to orange-50/50
    content = content.replace("bg-sage-soft/30", "bg-orange-50/50")

    with open(filepath, "w") as f:
        f.write(content)

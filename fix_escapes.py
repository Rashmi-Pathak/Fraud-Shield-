import os, glob

files = (
    glob.glob('backend/app/api/*.py') +
    glob.glob('backend/app/ml/*.py') +
    glob.glob('backend/app/fraud/*.py') +
    glob.glob('backend/app/streaming/*.py')
)

for path in files:
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    # Detect escaped quotes used as Python strings
    if '\\"' in content and path not in ['backend/app/api/transactions.py']:
        fixed = content.replace('\\"', '"')
        with open(path, 'w', encoding='utf-8') as f:
            f.write(fixed)
        print('Fixed:', path)
    else:
        print('OK:', path)

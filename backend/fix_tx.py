with open("app/api/transactions.py", "r", encoding="utf-8") as f:
    content = f.read()

# Fix the escaped quote issue - the file has literal backslash-quote sequences
content = content.replace('@router.get(\\"\\"', '@router.get("")')

with open("app/api/transactions.py", "w", encoding="utf-8") as f:
    f.write(content)

print("Fixed:", "@router.get" in content)

import json

class Database(dict):
    def __init__(self):
        with open("db.json", "+a") as f:
            f.seek(0)
            if f.readlines():
                f.seek(0)
                super().__init__(json.load(f))
            else:
                super().__init__({})
        self.path = "db.json"
        self.__next_id = len(self) + 1

    def select(self, id: str):
        try:
            return self[id]
        except KeyError:
            raise ValueError("Primary key doesn't exists")
    
    def selectall(self):
        return self

    def insert(self, name: str, email: str):
        cid = str(self.__next_id)
        if email in [v["email"] for v in self.values()]:
            raise ValueError("Email already exists")
        self[cid] = {"name": name, "email": email}
        with open("db.json", "w") as f:
            json.dump(self, f, indent=4)
        self.__next_id += 1
        return {"id": cid, "name": name, "email": email}
    
    def update(self, id: str, name: str | None = None, email: str | None = None):
        try:
            c = self.select(id)
            if name:
                c["name"] = name
            if email:
                c["email"] = email
            with open("db.json", "w") as f:
                json.dump(self, f, indent=4)
            return {"id": id, "name": c["name"], "email": c["email"]}
            
        except KeyError:
            raise ValueError("Primary key doesn't exists")
    
    def delete(self, id: str):
        try:
            self.pop(id)
            with open("db.json", "w") as f:
                json.dump(self, f, indent=4)
        except KeyError:
            raise ValueError("Primary key doesn't exists")


if __name__ == "__main__":
    m = Database()
    # print(m.selectall())
    # m.delete("8")
    # print(m.selectall())
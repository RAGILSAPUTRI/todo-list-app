from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import requests

app = Flask(__name__)
CORS(app)

# Konfigurasi database untuk MySQL atau PostgreSQL
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:B154411d@110.239.71.90/ragil'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    status = db.Column(db.String(50), nullable=False, default='belum selesai')

    def to_dict(self):
        return {"id": self.id, "title": self.title, "status": self.status}

# Buat tabel di database
with app.app_context():
    db.create_all()

@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    tasks = Task.query.all()
    return jsonify([task.to_dict() for task in tasks])

@app.route('/api/tasks', methods=['POST'])
def add_task():
    data = request.json
    new_task = Task(title=data.get('title', ''), status='belum selesai')
    db.session.add(new_task)
    db.session.commit()
    return jsonify(new_task.to_dict()), 201

@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    data = request.json
    task = Task.query.get(task_id)
    if task:
        task.title = data.get('title', task.title)
        task.status = data.get('status', task.status)
        db.session.commit()
        return jsonify(task.to_dict())
    return jsonify({'error': 'Task not found'}), 404

@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    task = Task.query.get(task_id)
    if task:
        db.session.delete(task)
        db.session.commit()
        return jsonify({'message': 'Task deleted'}), 200
    return jsonify({'error': 'Task not found'}), 404

@app.route('/api/additional-tasks', methods=['GET'])
def get_additional_tasks():
    response = requests.get("https://jsonplaceholder.typicode.com/todos")
    if response.status_code == 200:
        data = response.json()[:5]
        additional_tasks = [
            {"id": task["id"], "title": translate_title(task["title"]), "completed": task["completed"]}
            for task in data
        ]
        return jsonify(additional_tasks)
    else:
        return jsonify({"error": "Failed to fetch additional tasks"}), 500

def translate_title(title):
    translations = {
        "delectus aut autem": "Lakukan tugas segera",
        "quis ut nam facilis et officia qui": "Selesaikan laporan mingguan",
        "fugiat veniam minus": "Berikan persetujuan klien",
        "et porro tempora": "Siapkan presentasi",
        "laboriosam mollitia et enim quasi adipisci quia provident illum": "Perbarui data inventaris"
    }
    return translations.get(title, title)

if __name__ == '__main__':
    app.run(debug=True)

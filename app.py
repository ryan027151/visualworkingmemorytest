import os
from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
# Use the DATABASE_URL environment variable from Heroku
app.config['SQLALCHEMY_DATABASE_URI']='mysql://root:pan060700@localhost:3306/testing'
db = SQLAlchemy(app)

class Drawing(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    data_url = db.Column(db.Text, nullable=False)

@app.route('/')
def index():
    return render_template('index2.html')

@app.route('/store_drawing', methods=['POST'])
def store_drawing():
    data_url = request.json.get('drawing')
    print("Received Data URL:", data_url)
    if data_url:
        try:
            drawing = Drawing(data_url=data_url)
            db.session.add(drawing)
            db.session.commit()
            print("Drawing stored in the database.")
            return jsonify({'message': 'Drawing uploaded successfully.'}), 200
        except Exception as e:
            db.session.rollback()
            print("Error storing the drawing:", str(e))
            return jsonify({'error': 'Failed to store the drawing.'}), 500
    return jsonify({'error': 'No drawing data found.'}), 400

@app.route('/get_stored_image', methods=['GET'])
def get_stored_image():
    drawing = Drawing.query.first()
    if drawing:
        data_url = drawing.data_url
        return jsonify({'data_url': data_url})
    return jsonify({'error': 'No stored image found.'}), 404

@app.route('/view_image/<int:drawing_id>')
def view_image(drawing_id):
    drawing = Drawing.query.get(drawing_id)
    if drawing:
        return render_template('image.html', image_data=drawing.data_url)
    else:
        return "Drawing not found."


if __name__ == '__main__':
    port = int(os.environ.get("PORT",5000))
    app.run(host='0.0.0.0',port=port)

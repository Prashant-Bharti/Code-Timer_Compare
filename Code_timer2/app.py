from flask import Flask, request, jsonify, render_template
import subprocess
import uuid
import os
import tempfile
import time

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/run', methods=['POST'])
def run_code():
    data = request.get_json(force=True)
    code = data['code']

    temp_dir = tempfile.gettempdir()
    filename = os.path.join(temp_dir, f"{uuid.uuid4()}.cpp")
    exec_file = filename.replace('.cpp', '')

    try:
        with open(filename, 'w') as f:
            f.write(code)

        compile_result = subprocess.run(["g++", filename, "-o", exec_file],
                                        stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=5)

        if compile_result.returncode != 0:
            return jsonify({"error": compile_result.stderr.decode()})

        start = time.time()
        run_result = subprocess.run([exec_file], stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=5)
        end = time.time()

        elapsed = end - start
        output = run_result.stdout.decode() + run_result.stderr.decode()

        return jsonify({
            "output": output,
            "time": elapsed
        })

    except subprocess.TimeoutExpired:
        return jsonify({"error": "⏱️ Code execution timed out!"})

    finally:
        if os.path.exists(filename):
            os.remove(filename)
        if os.path.exists(exec_file):
            os.remove(exec_file)

if __name__ == '__main__':
    app.run(debug=True)
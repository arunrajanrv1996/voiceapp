from flask import current_app as app, render_template, jsonify, request
import os, json
import subprocess
from werkzeug.security import check_password_hash, generate_password_hash
from application.models import db, User, UserTranscription
from flask_security import  current_user,auth_required
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import datetime
import spacy
from collections import Counter
from openai import OpenAI

client = OpenAI(api_key="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" )

nlp = spacy.load("en_core_web_sm")

@app.route('/')
def index():
    return render_template('index.html')


def cuser_to_dict(user):
    return {
        'id': user.id,
        'username': user.username,
        'email': user.email,
    }

def puser_to_dict(user):
    return {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'image': user.image,
    }

def transcript_to_dict(transcript):
    return {
        'id': transcript.id,
        'text': transcript.transcription,
        'language': transcript.language,
        'user_id': transcript.user_id,
        'created_on': transcript.time,
    }

@app.route('/userlogin', methods=['POST'])
def userlogin():
    post_data = request.get_json()
    username = post_data.get('username')
    password = post_data.get('password')

    with app.app_context():
        user_datastore = app.security.datastore
        user = user_datastore.find_user(username=username)

        if not user:
            app.logger.info(f"No user found for username: {username}")
            return jsonify({'message': 'No user found!'})

        if check_password_hash(user.password, password):
            app.logger.info("Password validation successful")
            return jsonify({"token": user.get_auth_token()})
        else:
            app.logger.warning("Password validation failed")
            return jsonify({"message": "Wrong Password"})


@app.route("/userprofile", methods=['POST','PUT','GET'])
def userprofile():
    if request.method=='GET':
        user=User.query.filter_by(id=1).first()
        return jsonify(puser_to_dict(user))
    if request.method=='PUT':
        post_data = request.get_json()
        image = post_data.get('image')
        password = post_data.get('password')
        user=User.query.filter_by(id=1).first()
        if not user:
            return jsonify({'message': 'No user logged in'})
        if image:
            user.image=image
            db.session.commit()
        if password:
            user.password=generate_password_hash(password)
            db.session.commit()
        return jsonify({'message': 'User updated successfully!'})

@app.route('/currentuser/')
def currentuser():
    user=User.query.filter_by(id=1).first()
    if not user:
        return jsonify({'message': 'No user logged in'})
    return jsonify(cuser_to_dict(user))

@app.route('/createuser/')
def createuser():
    user=User.query.all()
    return jsonify([cuser_to_dict(user) for user in user]) 

@app.route('/registeruser/', methods=['POST'])
def registeruser():
    post_data = request.get_json()
    username = post_data.get('username')
    email = post_data.get('email')
    password = post_data.get('password')
    image = post_data.get('image')
    if not username:
        return jsonify({'message': 'Username is required'})
    if not email:
        return jsonify({'message': 'Email is required'})
    if not password:
        return jsonify({'message': 'Password is required'})
    user = User.query.filter_by(username=username,email=email).first()
    if user:
        return jsonify({'message': 'Username already exists'})
    with app.app_context():
        user_datastore = app.security.datastore
        if not user_datastore.find_user(username=username) and not user_datastore.find_user(email=email):
            user_datastore.create_user(username=username, email=email,image=image, password=generate_password_hash(password))
            db.session.commit()
            user = user_datastore.find_user(username=username)
            role = user_datastore.find_role('user')
            user_datastore.add_role_to_user(user, role)
            db.session.commit()

    return jsonify({'message': 'User created successfully!'})


@app.route('/usertranscript')
def usertranscript():
    user=UserTranscription.query.filter_by(user_id=1).order_by(UserTranscription.time.desc()).limit(30)
    return jsonify([transcript_to_dict(user) for user in user])


@app.route('/usertranscriptanalysis')
def compute_frequent_words_and_phrases():
    user_id = 1 

    # Calculate the most frequently used words for the current user
    user_transcriptions = UserTranscription.query.filter_by(user_id=user_id).all()
    all_transcriptions = " ".join([transcription.transcription for transcription in user_transcriptions])
    doc = nlp(all_transcriptions)
    frequent_words = [token.text for token in doc if token.is_alpha and not token.is_stop]
    frequent_words_counter = Counter(frequent_words)
    frequent_words_user = dict(frequent_words_counter.most_common(10))  # Adjust the number as needed

    # Calculate the most frequently used words across all users
    all_transcriptions = " ".join([transcription.transcription for transcription in UserTranscription.query.all()])
    doc_all_users = nlp(all_transcriptions)
    frequent_words_all_users = Counter([token.text for token in doc_all_users if token.is_alpha and not token.is_stop])
    frequent_words_all_users = dict(frequent_words_all_users.most_common(10))  # Adjust the number as needed

    return jsonify({'frequent_words_user': frequent_words_user, 'frequent_words_all_users': frequent_words_all_users})

@app.route('/useruniquephrases')
def get_user_unique_phrases():
    user_id = 1 

    # Retrieve all transcriptions for the current user
    user_transcriptions = UserTranscription.query.filter_by(user_id=user_id).all()

    # Extract and count phrases from the transcriptions
    all_phrases = []
    for transcription in user_transcriptions:
        phrases = extract_phrases(transcription.transcription)
        all_phrases.extend(phrases)

    # Count the frequency of each phrase
    phrase_counts = Counter(all_phrases)

    # Extract unique phrases used only once
    unique_phrases = [phrase for phrase, count in phrase_counts.items() if count == 1]

    # Return the first 3 unique phrases (or all if there are fewer than 3)
    return jsonify({'user_unique_phrases': unique_phrases[:3]})

def extract_phrases(text):
    # You can customize this function based on your requirements for extracting phrases
    doc = nlp(text)
    phrases = [chunk.text for chunk in doc.noun_chunks if len(chunk.text.split()) >= 2]
    return phrases



@app.route('/similarusers')
def find_similar_users():
    current_user_id = 1

    # Retrieve transcriptions for the current user
    current_user_transcriptions = UserTranscription.query.filter_by(user_id=current_user_id).all()

    if len(current_user_transcriptions) == 0:
        return jsonify({'similar_users': []})

    # Extract text from transcriptions
    current_user_text = " ".join([transcription.transcription for transcription in current_user_transcriptions])

    # Retrieve transcriptions for all users (excluding the current user)
    all_users_transcriptions = UserTranscription.query.filter(UserTranscription.user_id != current_user_id).all()

    if len(all_users_transcriptions) == 0:
        return jsonify({'similar_users': []})

    # Create a list of user texts
    all_users_texts = [" ".join([transcription.transcription for transcription in UserTranscription.query.filter_by(user_id=user_transcription.user_id).all()]) for user_transcription in all_users_transcriptions]

    # Calculate TF-IDF vectors for the current user and all users
    vectorizer = TfidfVectorizer()
    current_user_vector = vectorizer.fit_transform([current_user_text])
    all_users_vectors = vectorizer.transform(all_users_texts)

    # Calculate cosine similarity between the current user and all users
    similarities = cosine_similarity(current_user_vector, all_users_vectors)[0]

    # Get the indices of users with the highest similarity
    most_similar_user_indices = similarities.argsort()[:-4:-1]  # Get top 3 most similar users

    # Retrieve user information for the most similar users
    most_similar_users = [User.query.get(all_users_transcriptions[i].user_id) for i in most_similar_user_indices]

    # Convert user information to a dictionary format
    similar_users_info = []
    for i in range(len(most_similar_users)):
        if len(similar_users_info)==5:
            break
    similar_users_info=list(set(similar_users_info))

    return jsonify({'similar_users': similar_users_info})



@app.route('/speech/<lang>', methods=['POST'])
def speech(lang):
    user_id = request.form.get('user_id')
    audio_file = request.files['audio']

    # Create the directory if it doesn't exist
    audio_dir = os.path.join(app.root_path, 'static', 'js', 'audio')
    os.makedirs(audio_dir, exist_ok=True)

    # Save the audio file to a known location with Ogg extension
    audio_file_path = os.path.join(audio_dir, 'audio.ogg')
    audio_file.save(audio_file_path)
    audio_file_open = open(audio_file_path, "rb")
    try:
        if lang=="English":
            transcript = client.audio.transcriptions.create(
            model="whisper-1", 
            file=audio_file_open, 
            response_format="json",
            )
        else:
            transcript = client.audio.translations.create(
            model="whisper-1", 
            file=audio_file_open, 
            response_format="json",
            )

        if user_id!='null':
            user_transcription = UserTranscription(user_id=user_id, transcription=transcript.text, language=lang, time=datetime.datetime.now())
            db.session.add(user_transcription)
            db.session.commit()
        return jsonify({'text': transcript.text})
    except Exception as e:
        print(e)
        return jsonify({'text': 'Error in transcription'})
    finally:
        audio_file_open.close()
        os.remove(audio_file_path)

from app import create_app
import matplotlib
matplotlib.use('Agg')  # Configurer avant toute utilisation de matplotlib

app = create_app()

if __name__ == '__main__':
    # Démarrer en mode multi-thread avec plus de workers
    app.run(host='0.0.0.0', port=5000, threaded=True, debug=True)
from app import create_app  # Importe la fonction create_app de ton application Flask

# Créer l'application Flask en appelant la fonction create_app
app = create_app()

if __name__ == '__main__':
    # Exécution de l'application avec les options suivantes :
    # - debug=True pour activer le mode débogage (affichage d'erreurs détaillées)
    # - host='0.0.0.0' pour permettre l'écoute sur toutes les interfaces réseau
    # - port=5000 pour spécifier le port de l'application
    app.run(debug=True)

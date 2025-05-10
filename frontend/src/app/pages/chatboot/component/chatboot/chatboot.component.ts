import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface Message {
    role: string;
    text: string;
}

interface Recommendation {
    Product_Name: string;
    Brand_Name: string;
    Unit_Price: number;
}

@Component({
    selector: 'app-chatboot',
    standalone: true,
    templateUrl: './chatboot.component.html',
    styleUrls: ['./chatboot.component.scss'],
    imports: [FormsModule, CommonModule, HttpClientModule]
})
export class ChatbootComponent implements OnInit {
    userMessage: string = '';
    messages: Message[] = [];
    currentQuestion: string | null = null;
    questions: string[] = [
        "Bonjour! Je suis votre assistant beauté. Quels sont vos intérêts en matière de recommandation de produits?",
        "Quel est votre objectif cosmétique principal? (e.g., Hydratation, anti-âge, acné)",
        "Avez-vous des problèmes de peau spécifiques? (e.g., Sensibilité, rougeurs, sécheresse)",
        "Quelle est votre préférence en matière de cosmétiques? (e.g., Bio, vegan, conventionnel)",
        "Quel est votre type de peau? (e.g., Grasse, sèche, mixte)",
        "Quel est votre type de cheveux? (e.g., Gras, secs, colorés)",
        "Utilisez-vous des marques tunisiennes? Si oui, lesquelles?",
        "Préférez-vous les marques internationales?",
        "Préférez-vous les produits locaux ou internationaux?",
        "Quel est votre type d'achat? (e.g., En ligne, en magasin)",
        "Quel est votre critère d'achat principal? (e.g., Prix, qualité, marque)",
        "Quel est votre budget? (Faible, Moyen, Élevé)"
    ];
    currentQuestionIndex = 0;
    recommendations: Recommendation[] = []; // Pour stocker les recommandations structurées

    constructor(private http: HttpClient) { }

    ngOnInit(): void {
      this.http.get<{ response: string }>('http://localhost:5000/recommender/chat/start')
          .subscribe(data => {
              this.currentQuestion = data.response;
              this.addAssistantMessage(this.currentQuestion);
          }, error => {
              console.error("Erreur lors de l'initialisation du chat :", error);
          });
  }
  

    sendMessage(): void {
        if (this.userMessage.trim()) {
            this.messages.push({ role: 'user', text: this.userMessage });

            if (this.currentQuestionIndex < this.questions.length - 1) {
                this.currentQuestionIndex++;
                this.currentQuestion = this.questions[this.currentQuestionIndex];
                this.addAssistantMessage(this.currentQuestion);
            } else if (this.currentQuestionIndex === this.questions.length - 1) {
                this.addAssistantMessage("Merci pour vos réponses. Je vais vous donner des recommandations!");
                this.getRecommendations();
                this.currentQuestion = null; // Mark conversation as done for UI
            }

            this.userMessage = '';
        }
    }

    addAssistantMessage(text: string): void {
        this.messages.push({ role: 'assistant', text: text });
    }

    getRecommendations(): void {
        // Envoyer la dernière réponse (budget)
        this.http.post<{ recommendations: Recommendation[] }>('http://localhost:5000/recommender/chat/message', { message: this.userMessage })
            .subscribe(response => {
                if (response && response.recommendations && response.recommendations.length > 0) {
                    this.recommendations = response.recommendations;
                    this.addAssistantMessage("Voici vos recommandations:");
                } else {
                    this.addAssistantMessage("Aucune recommandation disponible.");
                }
            }, error => {
                this.addAssistantMessage("Erreur lors de la récupération des recommandations.");
                console.error(error);
            });
    }
}
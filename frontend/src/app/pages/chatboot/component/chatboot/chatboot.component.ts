import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { CommonModule } from '@angular/common'; // Import CommonModule
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-chatboot',
  standalone: true,  // Mark the component as standalone
  templateUrl: './chatboot.component.html',
  styleUrls: ['./chatboot.component.scss'],
  imports: [FormsModule, CommonModule, HttpClientModule]  // Add CommonModule here
})

export class ChatbootComponent {
  userMessage: string = '';
  messages: { role: string, text: string }[] = []; // Track chat messages
  currentQuestionIndex = 0; 
  userId: number = 1;  // Add a sample user ID for testing, you can set this dynamically

  // List of predefined questions to ask
  questions = [
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

  constructor(private http: HttpClient) {
    this.addAssistantMessage(this.questions[this.currentQuestionIndex]);
  }

  // Function to handle sending a message
  sendMessage(): void {
    if (this.userMessage.trim()) {
      // Display user's message
      this.messages.push({ role: 'user', text: this.userMessage });
      
      // Get next question for the assistant
      this.currentQuestionIndex++;

      // If we have more questions, the assistant will ask the next one
      if (this.currentQuestionIndex < this.questions.length) {
        this.addAssistantMessage(this.questions[this.currentQuestionIndex]);
      } else {
        // Once all questions are answered, give recommendations (this can be modified)
        this.addAssistantMessage("Merci pour vos réponses. Je vais vous donner des recommandations!");
        this.getRecommendations();  // Make sure to call the getRecommendations function
      }

      this.userMessage = '';  // Reset the input after sending
    }
  }

  // Add message from the assistant
  addAssistantMessage(text: string): void {
    this.messages.push({ role: 'assistant', text: text });
  }

  getRecommendations(): void {
    this.http.get(`http://localhost:5000/recommender/utilisateur/${this.userId}`)
      .subscribe((response: any) => {
        if (response && Array.isArray(response)) {
          const recommendations = response.map((item: any) =>
            `- ${item.Product_Name} (${item.Brand_Name}) - ${item.Unit_Price} TND`
          ).join('\n');
          this.messages.push({ role: 'assistant', text: `Voici vos recommandations:\n${recommendations}` });
        } else {
          this.messages.push({ role: 'assistant', text: "Aucune recommandation disponible." });
        }
      }, error => {
        this.messages.push({ role: 'assistant', text: "Erreur lors de la récupération des recommandations." });
        console.error(error);
      });
  }
  
}
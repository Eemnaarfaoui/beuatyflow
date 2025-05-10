import { Component, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-chatboot',
  standalone: true,
  templateUrl: './chatboot.component.html',
  styleUrls: ['./chatboot.component.scss'],
  imports: [FormsModule, CommonModule, HttpClientModule]
})
export class ChatbootComponent implements AfterViewChecked {
  userMessage: string = '';
  messages: { role: string, text: string }[] = [];
  currentQuestionIndex = 0;
  userId: number = 1;

  @ViewChild('chatBox') private chatBox!: ElementRef;

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

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    try {
      this.chatBox.nativeElement.scrollTop = this.chatBox.nativeElement.scrollHeight;
    } catch (err) { }
  }

  sendMessage(): void {
    if (this.userMessage.trim()) {
      this.messages.push({ role: 'user', text: this.userMessage });
      this.currentQuestionIndex++;

      if (this.currentQuestionIndex < this.questions.length) {
        this.addAssistantMessage(this.questions[this.currentQuestionIndex]);
      } else {
        this.addAssistantMessage("Merci pour vos réponses. Je vais vous donner des recommandations!");
        this.getRecommendations();
      }

      this.userMessage = '';
    }
  }

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
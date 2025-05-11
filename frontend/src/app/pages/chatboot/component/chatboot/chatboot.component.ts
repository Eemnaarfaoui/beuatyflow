import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-chatboot',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './chatboot.component.html',
  styleUrls: ['./chatboot.component.scss']
})
export class ChatbootComponent implements OnInit {
  @ViewChild('chatBox') chatBox: ElementRef | undefined;
  chatMessages: { sender: string, text: string }[] = [];
  currentStepIndex: number = 0;
  userPreferences: { [key: string]: string } = {};
  optionsMap: { [key: number]: string[] } = {
    1: ["Oui, totalement", "Peut-être", "Non, pas nécessaire"],
    2: ["Améliorer la santé de ma peau/cheveux", "Me maquiller au quotidien", "Suivre les tendances beauté"],
    3: ["Hydratation", "Réduction des rides", "Éclat et uniformité du teint", "Traitement de l’acné et des imperfections", "Sensibilité et rougeurs", "Other…"],
    4: ["Naturels / Bio", "Avec des ingrédients scientifiquement testés", "Peu importe, tant que le produit est efficace"],
    5: ["Sèche", "Mixte", "Grasse", "Sensible", "Normale", "Je ne sais pas"],
    6: ["Secs", "Abîmés", "Gras", "Normaux", "Bouclés", "Frisés", "Fins", "Colorés"],
    7: ["Oui, j'adore", "Parfois", "Non, je préfère les marques internationales"],
    8: ["Oui, j'adore", "Parfois", "Non, je préfère les marques tunisiennes"],
    9: ["Local", "International", "Peu importe"],
    10: ["En ligne", "En magasin", "Peu importe"],
    11: ["Prix", "Qualité", "Marque", "Ingrédients", "Autre"],
    12: ["Faible", "Moyen", "Élevé"]
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<{ response: string }>('http://localhost:5000/recommender/chat/start')
      .subscribe(res => {
        this.addAssistantMessage(res.response);
      });
  }

  selectOption(option: string): void {
    this.chatMessages.push({ sender: 'user', text: option });
    const requestData = {
      message: option,
      current_step_index: this.currentStepIndex,
      user_preferences: this.userPreferences
      
    };
    this.scrollToBottom();

    this.http.post<{ response: string, next_step_index: number, user_preferences: any }>(
      'http://localhost:5000/recommender/chat/message',
      requestData
    ).subscribe(res => {
      this.addAssistantMessage(res.response);
      this.currentStepIndex = res.next_step_index;
      this.userPreferences = res.user_preferences;
      this.scrollToBottom();
    
      if (this.currentStepIndex === 12) {
        this.addAssistantMessage("Merci d'avoir complété le questionnaire !");
      }
      
      // Affiche les options avec animation
      setTimeout(() => {
        const optionsBox = document.querySelector('.options-box');
        if (optionsBox) {
          optionsBox.classList.add('visible');
        }
      }, 200); // Animation après une courte pause
    });
  }
  

  addAssistantMessage(message: string): void {
    this.chatMessages.push({ sender: 'bot', text: message });
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    const chatBox = document.querySelector('.chat-box');
    if (chatBox) {
      chatBox.scrollTop = chatBox.scrollHeight;
    }
  }
  

  get currentOptions(): string[] {
    return this.optionsMap[this.currentStepIndex + 1] || [];
  }
}
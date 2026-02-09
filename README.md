# Central de Ambulâncias - Tela Única

Aplicativo web responsivo de **tela única** para gerenciamento de pedidos de transporte por ambulância operado por uma central.

## 🚀 Tecnologias

- **React.js** com Vite
- **JavaScript**
- **Tailwind CSS** para estilização
- **Leaflet** para mapas interativos
- **React Leaflet** para integração React

## 📦 Instalação

1. Instale as dependências:
```bash
npm install
```

2. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

3. Acesse `http://localhost:5173` no navegador

## 🎯 Estrutura da Tela Única

A aplicação funciona inteiramente em **uma única página**, dividida em 3 áreas principais:

### 🟦 Área 1 – Formulário de Criação de Ticket (Topo)
- Formulário sempre visível para atendimento rápido durante ligações
- Campos: paciente, telefone, endereço, destino, prioridade, observações
- Geocoding simulado ao criar ticket
- Feedback visual imediato

### 🟨 Área 2 – Lista de Tickets (Centro/Esquerda)
- Lista em tempo real dos pedidos registrados
- Cada card mostra: nome, telefone, prioridade, status, tempo de espera
- Filtros: busca, status, prioridade
- Ações rápidas: alterar status, marcar urgente, cancelar
- **Tickets urgentes sempre no topo**

### 🗺️ Área 3 – Mapa (Direita)
- Mapa interativo com Leaflet/OpenStreetMap
- Pins coloridos representando os tickets
- Cor do pin varia conforme prioridade (vermelho para urgente)
- Popup com informações ao clicar
- Reage automaticamente às alterações da lista

## 📁 Estrutura do Projeto

```
src/
 ├─ components/
 │   ├─ TicketForm.jsx      # Formulário de criação
 │   ├─ TicketList.jsx      # Lista com filtros
 │   ├─ TicketCard.jsx      # Card individual
 │   ├─ TicketFilters.jsx   # Componente de filtros
 │   └─ MapView.jsx         # Mapa interativo
 ├─ hooks/
 │   └─ useTickets.js       # Hook customizado para gerenciamento
 ├─ services/
 │   └─ ticketMockService.js # Serviços mock e helpers
 ├─ App.jsx                 # Componente principal (tela única)
 ├─ main.jsx
 └─ index.css
```

## 🎨 Status e Prioridades

### Status
- **Pendente** (amarelo)
- **Alocado** (azul)
- **Em Deslocamento** (roxo)
- **Concluído** (verde)
- **Cancelado** (cinza)

### Prioridades
- **Urgente** (vermelho) - sempre no topo
- **Alta** (laranja)
- **Média** (amarelo)
- **Baixa** (verde)

## 💾 Armazenamento

Os dados são salvos automaticamente no `localStorage` do navegador para persistência entre sessões.

## ✨ Funcionalidades

- ✅ Criar tickets com geocoding simulado
- ✅ Visualizar todos os tickets em lista
- ✅ Filtrar por status, prioridade e busca
- ✅ Alterar status dos tickets
- ✅ Marcar tickets como urgente
- ✅ Cancelar tickets
- ✅ Visualização no mapa interativo
- ✅ Pins coloridos por prioridade
- ✅ Scroll automático ao criar/visualizar ticket
- ✅ Feedback visual imediato
- ✅ Interface responsiva (desktop e tablet)

## 🚫 Limitações

- Não há backend real
- Geocoding é simulado (não usa API real)
- Dados são armazenados apenas localmente
- Não há autenticação

## 📝 Notas

Este é um protótipo frontend para validação da ideia. Todas as funcionalidades de backend são simuladas com mocks e dados locais. O código está organizado para facilitar a migração para um backend real no futuro.

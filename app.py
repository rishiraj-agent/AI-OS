import customtkinter as ctk

# App Theme setup
ctk.set_appearance_mode("System")  # Modes: "System", "Dark", "Light"
ctk.set_default_color_theme("blue")  # Themes: "blue", "green", "dark-blue"

class AIOSApp(ctk.CTk):
    def __init__(self):
        super().__init__()

        self.title("AI OS — One System. Every Possibility.")
        self.geometry("900x600")

        # Sidebar (Taskbar / Launcher concept)
        self.sidebar = ctk.CTkFrame(self, width=200, corner_radius=0)
        self.sidebar.pack(side="left", fill="y")

        self.logo_label = ctk.CTkLabel(self.sidebar, text="AI OS", font=ctk.CTkFont(size=20, weight="bold"))
        self.logo_label.pack(padx=20, pady=20)

        self.btn_dashboard = ctk.CTkButton(self.sidebar, text="Dashboard", command=self.open_dashboard)
        self.btn_dashboard.pack(padx=20, pady=10)

        self.btn_terminal = ctk.CTkButton(self.sidebar, text="AI Terminal", command=self.open_terminal)
        self.btn_terminal.pack(padx=20, pady=10)

        # Main Content Area
        self.main_area = ctk.CTkFrame(self, fg_transparent=True)
        self.main_area.pack(side="right", expand=True, fill="both", padx=20, pady=20)

        self.welcome_label = ctk.CTkLabel(self.main_area, text="Welcome to AI OS Desktop", font=ctk.CTkFont(size=24))
        self.welcome_label.pack(pady=50)

        # AIA Search Box Simulation
        self.search_entry = ctk.CTkEntry(self.main_area, placeholder_text="Ask AIA (e.g., 'Make my PC ready for game dev')...", width=500)
        self.search_entry.pack(pady=10)

    def open_dashboard(self):
        self.welcome_label.configure(text="AI OS Dashboard & Hardware Center")

    def open_terminal(self):
        self.welcome_label.configure(text="AI Terminal Mode Active (Bash/PowerShell)")

if __name__ == "__main__":
    app = AIOSApp()
    app.mainloop()
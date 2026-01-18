import React from "react";
import { cn } from "@/lib/utils";
import { Users, History, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";

export const BottomTabbar: React.FC = () => {
  const navigate = useNavigate();
  const { currentProject, currentProjectMember } = useApp();

  const goTo = (tab: "teams" | "history" | "wallet") => {
    navigate(`/${tab}`);
  };

  const isPersonalMode = !currentProject;
  const isDirectorInProject =
    !!currentProject && currentProjectMember?.role === "direccion";

  const showHistoryAndWalletTabs = isPersonalMode || isDirectorInProject;

  return (
    <div className="fixed index bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md z-10">
      <div className="bg-card border border-border rounded-full shadow-material p-2 flex items-center justify-between">
        <button
          className={cn(
            "flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm text-muted-foreground hover:bg-muted"
          )}
          onClick={() => goTo("teams")}
        >
          <Users className="w-4 h-4" />
          Equipos
        </button>
        {showHistoryAndWalletTabs && (
          <>
            <button
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm text-muted-foreground hover:bg-muted"
              )}
              onClick={() => goTo("history")}
            >
              <History className="w-4 h-4" />
              Historial
            </button>
            <button
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm text-muted-foreground hover:bg-muted"
              )}
              onClick={() => goTo("wallet")}
            >
              <Wallet className="w-4 h-4" />
              Wallet
            </button>
          </>
        )}
      </div>
    </div>
  );
};

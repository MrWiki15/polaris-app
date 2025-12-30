import React, { useState, useMemo } from "react";
import { useApp } from "@/contexts/AppContext";
import {
  Users,
  Plus,
  DollarSign,
  Phone,
  Mail,
  MapPin,
  Edit2,
  Trash2,
  User,
  Building2,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ExportButtons } from "@/components/ui/ExportButtons";
import { Client, Worker } from "@/lib/storage";
import { cn } from "@/lib/utils";
import { ExportData } from "@/lib/exportUtils";

export const MiniCRM: React.FC = () => {
  const {
    data,
    addClient,
    updateClient,
    deleteClient,
    addWorker,
    updateWorker,
    deleteWorker,
  } = useApp();

  const { clients, settings, workers } = data;
  const isPremium = settings.isPremium || false;

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingKind, setEditingKind] = useState<"client" | "worker" | null>(
    null
  );
  const [filter, setFilter] = useState<"all" | "cliente" | "proveedor">("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
    type: "cliente" as "cliente" | "proveedor" | "trabajador",
    role: "",
    salary: "",
  });

  const filteredClients = useMemo(() => {
    let result = clients;
    if (filter !== "all") result = result.filter((c) => c.type === filter);
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(term) ||
          c.phone?.toLowerCase().includes(term) ||
          c.email?.toLowerCase().includes(term)
      );
    }
    return result;
  }, [clients, filter, searchTerm]);

  const clientCount = clients.filter((c) => c.type === "cliente").length;
  const providerCount = clients.filter((c) => c.type === "proveedor").length;

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setEditingKind(null);
    setFormData({
      name: "",
      phone: "",
      email: "",
      address: "",
      notes: "",
      type: "cliente",
      role: "",
      salary: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.type === "trabajador") {
      const salary = Number(formData.salary || 0);
      const workerData: Omit<Worker, "id" | "createdAt"> = {
        name: formData.name,
        role: formData.role || undefined,
        salary,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
      };

      if (editingKind === "worker" && editingId)
        updateWorker(editingId, workerData);
      else addWorker(workerData);
    } else {
      const clientData: Omit<Client, "id" | "createdAt"> = {
        name: formData.name,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        address: formData.address || undefined,
        type: formData.type as Client["type"],
        notes: formData.notes || undefined,
      };

      if (editingKind === "client" && editingId)
        updateClient(editingId, clientData);
      else addClient(clientData);
    }

    resetForm();
  };

  const handleEditClient = (c: Client) => {
    setEditingId(c.id);
    setEditingKind("client");
    setFormData({
      name: c.name,
      phone: c.phone || "",
      email: c.email || "",
      address: c.address || "",
      notes: c.notes || "",
      type: c.type,
      role: "",
      salary: "",
    });
    setShowForm(true);
  };

  const handleEditWorker = (w: Worker) => {
    setEditingId(w.id);
    setEditingKind("worker");
    setFormData({
      name: w.name,
      phone: w.phone || "",
      email: w.email || "",
      address: "",
      notes: "",
      type: "trabajador",
      role: w.role || "",
      salary: String(w.salary || 0),
    });
    setShowForm(true);
  };

  const handleDeleteClient = (id: string) => {
    if (confirm("¿Eliminar este contacto?")) deleteClient(id);
  };
  const handleDeleteWorker = (id: string) => {
    if (confirm("¿Eliminar este trabajador?")) deleteWorker(id);
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="bg-gradient-to-br from-success/10 to-success/5 rounded-2xl p-4 sm:p-6 border border-success/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-success/10 rounded-xl">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-success" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold">Mini CRM</h2>
              <p className="text-sm text-muted-foreground">
                {clientCount} clientes • {providerCount} proveedores
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isPremium ? (
              <Button
                onClick={() => {
                  setEditingKind("worker");
                  setFormData((prev) => ({ ...prev, type: "trabajador" }));
                  setShowForm(true);
                }}
                className="ml-2 gradient-secondary w-full"
              >
                <DollarSign className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Nuevo Trabajador</span>
              </Button>
            ) : (
              <Button
                onClick={() => {
                  setEditingKind("client");
                  setFormData((prev) => ({ ...prev, type: "cliente" }));
                  setShowForm(true);
                }}
                className="gradient-primary"
              >
                <Plus className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Nuevo Contacto</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            {[
              { key: "all", label: "Todos" },
              { key: "cliente", label: "Clientes" },
              { key: "proveedor", label: "Proveedores" },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key as any)}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all",
                  filter === f.key
                    ? "bg-primary text-primary-foreground shadow-material"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
            onClick={resetForm}
          />
          <div className="relative w-full sm:max-w-md bg-card rounded-t-3xl sm:rounded-2xl shadow-material-xl max-h-[90vh] overflow-auto">
            <div className="sm:hidden flex justify-center pt-3 pb-1">
              <div className="w-12 h-1.5 rounded-full bg-muted" />
            </div>
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold">
                {editingKind === "worker"
                  ? editingId
                    ? "Editar Trabajador"
                    : "Nuevo Trabajador"
                  : editingId
                  ? "Editar Contacto"
                  : "Nuevo Contacto"}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: "cliente", label: "Cliente" },
                    { key: "proveedor", label: "Proveedor" },
                    { key: "trabajador", label: "Trabajador" },
                  ].map((f) => (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, type: f.key as any }))
                      }
                      className={cn(
                        "flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all",
                        formData.type === f.key
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-muted-foreground"
                      )}
                    >
                      {f.key === "cliente" ? (
                        <User className="w-4 h-4" />
                      ) : f.key === "proveedor" ? (
                        <Building2 className="w-4 h-4" />
                      ) : (
                        <DollarSign className="w-4 h-4" />
                      )}
                      <span>{f.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input
                  required
                  placeholder="Nombre completo o empresa"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input
                  placeholder="+53..."
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, phone: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                />
              </div>

              {formData.type !== "trabajador" && (
                <>
                  <div className="space-y-2">
                    <Label>Dirección</Label>
                    <Input
                      placeholder="Dirección..."
                      value={formData.address}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          address: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Notas</Label>
                    <Input
                      placeholder="Notas adicionales..."
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          notes: e.target.value,
                        }))
                      }
                    />
                  </div>
                </>
              )}

              {formData.type === "trabajador" && (
                <>
                  <div className="space-y-2">
                    <Label>Rol</Label>
                    <Input
                      value={formData.role}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          role: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Salario mensual</Label>
                    <Input
                      value={formData.salary}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          salary: e.target.value,
                        }))
                      }
                    />
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={resetForm}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1 gradient-primary">
                  {editingId ? "Guardar" : "Crear"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {filteredClients.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => (
            <div
              key={client.id}
              className="bg-card rounded-2xl p-4 shadow-soft border border-border hover:shadow-material transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "p-2 rounded-xl",
                      client.type === "cliente"
                        ? "bg-primary/10"
                        : "bg-success/10"
                    )}
                  >
                    {client.type === "cliente" ? (
                      <User className="w-5 h-5 text-primary" />
                    ) : (
                      <Building2 className="w-5 h-5 text-success" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold">{client.name}</h4>
                    <span
                      className={cn(
                        "text-xs px-2 py-0.5 rounded-full",
                        client.type === "cliente"
                          ? "bg-primary/10 text-primary"
                          : "bg-success/10 text-success"
                      )}
                    >
                      {client.type === "cliente" ? "Cliente" : "Proveedor"}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="w-8 h-8"
                    onClick={() => handleEditClient(client)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="w-8 h-8 text-destructive hover:bg-destructive/10"
                    onClick={() => handleDeleteClient(client.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                {client.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span>{client.phone}</span>
                  </div>
                )}
                {client.email && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{client.email}</span>
                  </div>
                )}
                {client.address && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{client.address}</span>
                  </div>
                )}
              </div>
              {client.notes && (
                <p className="mt-3 pt-3 border-t border-border text-sm text-muted-foreground line-clamp-2">
                  {client.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No hay contactos</p>
          <Button
            variant="link"
            onClick={() => {
              setEditingKind("client");
              setFormData((prev) => ({ ...prev, type: "cliente" }));
              setShowForm(true);
            }}
            className="mt-2"
          >
            Agregar el primero
          </Button>
        </div>
      )}

      {isPremium && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3">Trabajadores</h3>
          {workers && workers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {workers.map((w) => (
                <div
                  key={w.id}
                  className="bg-card rounded-2xl p-4 shadow-soft border border-border hover:shadow-material transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold">{w.name}</h4>
                      <div className="text-sm text-muted-foreground">
                        {w.role || "—"}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="w-8 h-8"
                        onClick={() => handleEditWorker(w)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="w-8 h-8 text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteWorker(w.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {w.phone || "-"}
                    </div>
                    <div className="font-semibold">{w.salary}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-muted-foreground">
              No hay trabajadores añadidos.
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end">
        <ExportButtons
          data={useMemo<ExportData>(
            () => ({
              title: "Reporte de Contactos - Mini CRM",
              headers: [
                "Tipo",
                "Nombre",
                "Teléfono",
                "Email",
                "Dirección",
                "Notas",
              ],
              rows: filteredClients.map((client) => [
                client.type === "cliente" ? "Cliente" : "Proveedor",
                client.name,
                client.phone || "-",
                client.email || "-",
                client.address || "-",
                client.notes || "-",
              ]),
              summary: [
                { label: "Total contactos", value: filteredClients.length },
                { label: "Clientes", value: clientCount },
                { label: "Proveedores", value: providerCount },
              ],
            }),
            [filteredClients, clientCount, providerCount]
          )}
          filename="crm"
          isPremium={isPremium}
        />
      </div>
    </div>
  );
};

export default MiniCRM;

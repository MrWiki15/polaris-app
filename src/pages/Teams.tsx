import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Hammer, ArrowLeft } from "lucide-react";

export default function Teams() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-4">
      <Card className="w-full max-w-md p-8 text-center space-y-6">
        <div className="flex justify-center">
          <div className="p-4 bg-warning/10 rounded-full">
            <Hammer className="w-12 h-12 text-warning" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold">En Construcción</h1>
          <p className="text-muted-foreground">
            Esta sección está siendo desarrollada y se desbloqueará en próximas
            actualizaciones.
          </p>
        </div>

        <div className="space-y-2 text-sm text-muted-foreground">
          <p>Gracias por tu paciencia. Estamos trabajando para traerte:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Gestión de equipos</li>
            <li>Asignación de permisos</li>
            <li>Colaboración en proyectos</li>
          </ul>
        </div>

        <Button onClick={() => navigate(-1)} className="w-full">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
      </Card>
    </div>
  );
}

// export default Teams;
//         .contains("members", JSON.stringify([{ email: userEmail }]));
//       if (error) throw error;
//       return (data || []) as Project[];
//     },
//   });

//   const deleteMutation = useMutation({
//     mutationFn: async (id: number) => {
//       const { error } = await supabase.from("projects").delete().eq("id", id);
//       if (error) throw error;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["projects", userEmail] });
//       toast({ title: "Proyecto eliminado" });
//     },
//     onError: (err: any) => {
//       toast({
//         title: "Error al eliminar",
//         description: err?.message || "Intenta de nuevo",
//       });
//     },
//   });

//   const [open, setOpen] = useState(false);
//   const [name, setName] = useState("");
//   const [type, setType] = useState<"tradicional" | "digital">("tradicional");
//   const [departaments, setDepartaments] = useState<string[]>(
//     DEPARTAMENTS.map((d) => d.id),
//   );
//   const [initialBalance, setInitialBalance] = useState<string>("0");
//   const [file, setFile] = useState<File | null>(null);
//   const [isCreating, setIsCreating] = useState(false);
//   const [memberEmail, setMemberEmail] = useState("");
//   const [memberDepartament, setMemberDepartament] = useState("ventas");
//   const [memberRole, setMemberRole] = useState("empleado");
//   const [isAddingMember, setIsAddingMember] = useState(false);
//   const [isRemovingMember, setIsRemovingMember] = useState(false);

//   const canSubmit = useMemo(() => {
//     return !!name && !!type && departaments.length > 0 && !!userEmail;
//   }, [name, type, departaments, userEmail]);

//   const handleToggleDepartament = (id: string, checked: boolean) => {
//     setDepartaments((prev) =>
//       checked
//         ? Array.from(new Set([...prev, id]))
//         : prev.filter((d) => d !== id),
//     );
//   };

//   const handleCreate = async () => {
//     if (!canSubmit || !userEmail) return;
//     setIsCreating(true);
//     try {
//       let imageUrl: string | null = null;

//       if (file) {
//         const path = `${userEmail}/${Date.now()}_${file.name}`;
//         const { error: uploadError } = await supabase.storage
//           .from("project-logos")
//           .upload(path, file, { upsert: false });
//         if (uploadError) throw uploadError;
//         const { data } = supabase.storage
//           .from("project-logos")
//           .getPublicUrl(path);
//         imageUrl = data.publicUrl;
//       }

//       const wallets: Wallet[] = [];

//       // Create wallets for each department sequentially
//       for (const departament of departaments) {
//         try {
//           const wallet = await createHederaWallet();
//           const privateKey = wallet.privateKey;
//           const address = wallet.accountId;

//           const passphrase = import.meta.env.VITE_ENCRIPTED_KEY || "";
//           const encryptedKey = await encrypt(privateKey, passphrase);

//           wallets.push({
//             name: departament,
//             address,
//             privateKey: encryptedKey,
//           });
//         } catch (error) {
//           console.error(`Error creating wallet for ${departament}:`, error);
//           throw error; // Re-throw to handle in the outer try-catch
//         }
//       }

//       //crear la coleccion nft del proyecto
//       const nftColection = await createHederaNftCollection(name);
//       const collection = nftColection;

//       const newProject: Omit<Project, "id"> = {
//         name,
//         image: imageUrl,
//         type,
//         members: [
//           {
//             email: userEmail,
//             role: "direccion",
//             departament: "direccion",
//           },
//         ],
//         departaments,
//         data: {},
//         history: [],
//         wallets,
//         collection,
//         initial_balance: initialBalance || "0",
//       };

//       const { error: insertError } = await supabase
//         .from("projects")
//         .insert([newProject]);
//       if (insertError) throw insertError;

//       toast({ title: "Proyecto creado" });
//       setOpen(false);
//       setName("");
//       setType("tradicional");
//       setDepartaments(DEPARTAMENTS.map((d) => d.id));
//       setInitialBalance("0");
//       setFile(null);
//       queryClient.invalidateQueries({ queryKey: ["projects", userEmail] });
//     } catch (err: any) {
//       toast({
//         title: "Error al crear",
//         description: err?.message || "Revisa los datos e intenta de nuevo",
//       });
//     } finally {
//       setIsCreating(false);
//     }
//   };

//   const handleAddMember = async () => {
//     if (
//       !currentProject ||
//       !currentProjectMember ||
//       currentProjectMember.role !== "direccion"
//     ) {
//       return;
//     }
//     if (!memberEmail || !memberDepartament) return;
//     setIsAddingMember(true);
//     try {
//       const { data, error } = await supabase
//         .from("projects")
//         .select("id,members")
//         .eq("id", currentProject.id)
//         .single();
//       if (error) throw error;
//       const members = (data?.members as ProjectMember[]) || [];
//       const exists = members.some(
//         (m) => m.email.toLowerCase() === memberEmail.toLowerCase(),
//       );
//       if (exists) {
//         toast({
//           title: "Miembro ya existe",
//           description: "Ese email ya forma parte del proyecto",
//         });
//         setIsAddingMember(false);
//         return;
//       }
//       const updatedMembers: ProjectMember[] = [
//         ...members,
//         {
//           email: memberEmail,
//           departament: memberDepartament,
//           role: memberRole,
//         },
//       ];
//       const { error: updateError } = await supabase
//         .from("projects")
//         .update({ members: updatedMembers })
//         .eq("id", currentProject.id);
//       if (updateError) throw updateError;
//       toast({ title: "Miembro añadido" });
//       setMemberEmail("");
//       setMemberDepartament("ventas");
//       setMemberRole("empleado");
//       queryClient.invalidateQueries({ queryKey: ["projects", userEmail] });
//     } catch (err: any) {
//       toast({
//         title: "Error al añadir miembro",
//         description: err?.message || "Intenta de nuevo",
//       });
//     } finally {
//       setIsAddingMember(false);
//     }
//   };

//   const handleRemoveMember = async (member: ProjectMember) => {
//     if (
//       !currentProject ||
//       !currentProjectMember ||
//       currentProjectMember.role !== "direccion"
//     ) {
//       return;
//     }
//     if (!member.email) return;
//     setIsRemovingMember(true);
//     try {
//       const { data, error } = await supabase
//         .from("projects")
//         .select("id,members")
//         .eq("id", currentProject.id)
//         .single();
//       if (error) throw error;
//       const members = (data?.members as ProjectMember[]) || [];
//       const updatedMembers = members.filter(
//         (m) => m.email.toLowerCase() !== member.email.toLowerCase(),
//       );
//       const { error: updateError } = await supabase
//         .from("projects")
//         .update({ members: updatedMembers })
//         .eq("id", currentProject.id);
//       if (updateError) throw updateError;
//       toast({ title: "Miembro eliminado" });
//       queryClient.invalidateQueries({ queryKey: ["projects", userEmail] });
//     } catch (err: any) {
//       toast({
//         title: "Error al eliminar miembro",
//         description: err?.message || "Intenta de nuevo",
//       });
//     } finally {
//       setIsRemovingMember(false);
//     }
//   };

//   const isRestrictedDirector =
//     !!currentProject &&
//     currentProjectMember?.role === "direccion" &&
//     currentProjectMember?.departament !== "direccion";

//   if (isRestrictedDirector) {
//     const activeProject = (projects || []).find(
//       (p) => p.id === currentProject!.id,
//     );
//     const members = activeProject?.members || currentProject!.members || [];

//     return (
//       <div className="p-4 space-y-6 mb-20">
//         <div className="mb-4 rounded-xl border border-border p-3 bg-muted/40 text-sm">
//           <div className="font-medium">
//             Modo proyecto: {currentProject!.name}
//           </div>
//         </div>
//         <div className="border rounded-lg p-3">
//           <div className="text-sm font-medium mb-2">Miembros del equipo</div>
//           <div className="space-y-1 text-sm">
//             {members.map((m) => (
//               <div
//                 key={`${m.email}-${m.departament}-${m.role}`}
//                 className="flex justify-between items-center border-b border-border/60 last:border-0 py-1"
//               >
//                 <span>{m.email}</span>
//                 <span className="text-xs text-muted-foreground">
//                   {m.departament} • {m.role}
//                 </span>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-4 space-y-6 mb-20">
//       {!!currentProject && (
//         <div className="mb-4 rounded-xl border border-border p-3 bg-muted/40 text-sm">
//           <div className="font-medium">
//             Modo proyecto: {currentProject?.name} (Equipos)
//           </div>
//         </div>
//       )}
//       <div className="flex items-center justify-between">
//         <h1 className="text-xl font-semibold">Proyectos</h1>
//         <Dialog open={open} onOpenChange={setOpen}>
//           <DialogTrigger asChild>
//             <Button className="gap-2">
//               <Plus className="h-4 w-4" />
//               Nuevo proyecto
//             </Button>
//           </DialogTrigger>
//           <DialogContent className="sm:max-w-[520px]">
//             <DialogHeader>
//               <DialogTitle>Crear proyecto</DialogTitle>
//             </DialogHeader>
//             <div className="space-y-4">
//               <div className="grid gap-2">
//                 <Label>Nombre</Label>
//                 <Input
//                   value={name}
//                   onChange={(e) => setName(e.target.value)}
//                   placeholder="Mi proyecto"
//                 />
//               </div>
//               <div className="grid gap-2">
//                 <Label>Logo</Label>
//                 <div className="flex items-center gap-3">
//                   <Input
//                     type="file"
//                     accept="image/*"
//                     onChange={(e) => {
//                       const f = e.target.files?.[0] || null;
//                       setFile(f || null);
//                     }}
//                   />
//                   <ImageIcon className="h-5 w-5 text-muted-foreground" />
//                 </div>
//               </div>
//               <div className="grid gap-2">
//                 <Label>Tipo</Label>
//                 <Select value={type} onValueChange={(v) => setType(v as any)}>
//                   <SelectTrigger>
//                     <SelectValue placeholder="Selecciona tipo" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="tradicional">Tradicional</SelectItem>
//                     <SelectItem value="digital">Digital</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//               <div className="grid gap-2">
//                 <Label>Departamentos</Label>
//                 <div className="grid grid-cols-2 gap-2">
//                   {DEPARTAMENTS.map((d) => {
//                     const checked = departaments.includes(d.id);
//                     return (
//                       <label
//                         key={d.id}
//                         className={cn(
//                           "flex items-center gap-2 rounded-md border p-2",
//                           checked ? "bg-muted" : "",
//                         )}
//                       >
//                         <Checkbox
//                           checked={checked}
//                           onCheckedChange={(c) =>
//                             handleToggleDepartament(d.id, !!c)
//                           }
//                         />
//                         <span>{d.label}</span>
//                       </label>
//                     );
//                   })}
//                 </div>
//               </div>
//               <div className="grid gap-2">
//                 <Label>Balance inicial</Label>
//                 <Input
//                   value={initialBalance}
//                   onChange={(e) => setInitialBalance(e.target.value)}
//                   placeholder="0"
//                 />
//               </div>
//               <div className="flex justify-end gap-2 pt-2">
//                 <Button
//                   variant="outline"
//                   onClick={() => setOpen(false)}
//                   disabled={isCreating}
//                 >
//                   Cancelar
//                 </Button>
//                 <Button
//                   onClick={handleCreate}
//                   disabled={!canSubmit || isCreating}
//                 >
//                   Crear
//                 </Button>
//               </div>
//             </div>
//           </DialogContent>
//         </Dialog>
//       </div>

//       {isLoading && <div>Cargando proyectos...</div>}
//       {error && (
//         <div className="text-red-600">
//           Error al cargar proyectos. Intenta de nuevo.
//         </div>
//       )}

//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//         {(projects || []).map((p) => (
//           <div
//             key={p.id}
//             className="border rounded-lg p-3 flex flex-col gap-3 cursor-pointer"
//             onClick={() => {
//               const member =
//                 p.members?.find((m) => m.email === userEmail) || null;
//               setCurrentProject(
//                 {
//                   id: p.id,
//                   name: p.name,
//                   members: p.members || [],
//                   departaments: p.departaments || [],
//                   wallets: p.wallets || [],
//                   initial_balance: p.initial_balance,
//                 },
//                 member,
//               );
//             }}
//           >
//             <div className="flex items-center gap-3">
//               <div className="h-12 w-12 rounded bg-muted overflow-hidden flex items-center justify-center">
//                 {p.image ? (
//                   <img
//                     alt={p.name}
//                     src={p.image}
//                     className="h-full w-full object-cover"
//                   />
//                 ) : (
//                   <ImageIcon className="h-6 w-6 text-muted-foreground" />
//                 )}
//               </div>
//               <div className="flex-1">
//                 <div className="font-medium">{p.name}</div>
//                 <div className="text-xs text-muted-foreground capitalize">
//                   {p.type}
//                 </div>
//               </div>
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 onClick={() => {
//                   if (supabaseAuth.user?.email === p.members[0].email) {
//                     deleteMutation.mutate(p.id);
//                   } else {
//                     toast({
//                       title: "Solo el creador puede eliminar",
//                       description: "Intenta de nuevo",
//                     });
//                   }
//                 }}
//                 title="Eliminar"
//               >
//                 <Trash2 className="h-4 w-4" />
//               </Button>
//             </div>
//             <div className="flex flex-wrap gap-2">
//               {p.departaments?.map((d) => {
//                 const label = DEPARTAMENTS.find((x) => x.id === d)?.label || d;
//                 return (
//                   <span
//                     key={d}
//                     className="text-xs px-2 py-1 rounded-full bg-muted"
//                   >
//                     {label}
//                   </span>
//                 );
//               })}
//             </div>
//           </div>
//         ))}
//       </div>

//       {currentProject && currentProjectMember?.role === "direccion" && (
//         <div className="mt-8 space-y-4">
//           <h2 className="text-lg font-semibold flex items-center gap-2">
//             <UserPlus className="h-5 w-5" />
//             Gestionar miembros de {currentProject.name}
//           </h2>
//           <div className="grid gap-3 md:grid-cols-[2fr,1fr,1fr,auto] items-end">
//             <div className="space-y-1">
//               <Label>Email del miembro</Label>
//               <Input
//                 type="email"
//                 placeholder="usuario@ejemplo.com"
//                 value={memberEmail}
//                 onChange={(e) => setMemberEmail(e.target.value)}
//               />
//             </div>
//             <div className="space-y-1">
//               <Label>Departamento</Label>
//               <select
//                 className="w-full px-3 py-2 rounded-md border border-border bg-background"
//                 value={memberDepartament}
//                 onChange={(e) => setMemberDepartament(e.target.value)}
//               >
//                 {DEPARTAMENTS.map((d) => (
//                   <option key={d.id} value={d.id}>
//                     {d.label}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <div className="space-y-1">
//               <Label>Rol</Label>
//               <select
//                 className="w-full px-3 py-2 rounded-md border border-border bg-background"
//                 value={memberRole}
//                 onChange={(e) => setMemberRole(e.target.value)}
//               >
//                 <option value="empleado">Empleado</option>
//                 <option value="direccion">Dirección</option>
//               </select>
//             </div>
//             <div>
//               <Button
//                 className="mt-2 md:mt-0 w-full"
//                 onClick={handleAddMember}
//                 disabled={isAddingMember || !memberEmail}
//               >
//                 Añadir
//               </Button>
//             </div>
//           </div>
//           <div className="mt-4 border rounded-lg p-3">
//             <div className="text-sm font-medium mb-2">Miembros actuales</div>
//             <div className="space-y-1 text-sm">
//               {(projects || [])
//                 .find((p) => p.id === currentProject.id)
//                 ?.members?.map((m) => (
//                   <div
//                     key={`${m.email}-${m.departament}-${m.role}`}
//                     className="flex justify-between items-center border-b border-border/60 last:border-0 py-1"
//                   >
//                     <span>{m.email}</span>
//                     <span className="text-xs text-muted-foreground">
//                       {m.departament} • {m.role}
//                     </span>

//                     <div className="flex items-center gap-2">
//                       <Button
//                         variant="ghost"
//                         size="icon"
//                         onClick={() => handleRemoveMember(m)}
//                         title="Eliminar"
//                       >
//                         <Trash2 className="h-4 w-4" />
//                       </Button>
//                     </div>
//                   </div>
//                 ))}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

import { useState, useRef, useMemo } from "react";
import { Upload, FileText, Download, Trash2, Database, Zap, CheckCircle2, Filter, Layout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  
  // Stats
  const [totalLines, setTotalLines] = useState<number>(0);
  const [uniqueLines, setUniqueLines] = useState<string[]>([]);
  const [hasProcessed, setHasProcessed] = useState(false);
  const [detectedCountries, setDetectedCountries] = useState<string[]>([]);

  // Filter
  const [mailFilter, setMailFilter] = useState<string>("");
  const [activeFilter, setActiveFilter] = useState<number | null>(null);
  const [onlyWithMails, setOnlyWithMails] = useState(false);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [activeCountryFilter, setActiveCountryFilter] = useState<string[]>([]);
  const [dateFilter, setDateFilter] = useState<string>("none");
  const [activeDateFilter, setActiveDateFilter] = useState<string>("none");

  const fileInputRef = useRef<HTMLInputElement>(null);

  function extractDateOnly(line: string) {
    const match = line.match(/Date\s*=\s*([0-9]{4}-[0-9]{2}-[0-9]{2})/i);
    if (!match) return null;

    const [year, month, day] = match[1].split('-').map(Number);

    return new Date(Date.UTC(year, month - 1, day));
  }

  function passesLast3MonthsFilter(line: string, filterValue: string) {
    if (filterValue === "none") return true;

    const lineDate = extractDateOnly(line);
    if (!lineDate) return false;

    const now = new Date();
    const todayUTC = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate()
    ));

    const diffMs = todayUTC.getTime() - lineDate.getTime();
    if (diffMs < 0) return false;

    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    return diffDays <= 90;
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files).filter(f => f.name.endsWith('.txt'));
      if (droppedFiles.length > 0) {
        setFiles(prev => [...prev, ...droppedFiles]);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files).filter(f => f.name.endsWith('.txt'));
      if (selectedFiles.length > 0) {
        setFiles(prev => [...prev, ...selectedFiles]);
      }
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (indexToRemove: number) => {
    setFiles(files.filter((_, index) => index !== indexToRemove));
  };

  const clearAll = () => {
    setFiles([]);
    setTotalLines(0);
    setUniqueLines([]);
    setHasProcessed(false);
    setMailFilter("");
    setActiveFilter(null);
    setOnlyWithMails(false);
    setSelectedCountries([]);
    setActiveCountryFilter([]);
    setDetectedCountries([]);
    setDateFilter("none");
    setActiveDateFilter("none");
  };

  const processFiles = async () => {
    if (files.length === 0) return;
    
    setIsProcessing(true);
    
    try {
      let totalCount = 0;
      const uniqueSet = new Set<string>();
      const countriesSet = new Set<string>();
      const countryRegex = /Country\s*=\s*([A-Za-z]{2})/i;
      
      for (const file of files) {
        const text = await file.text();
        const lines = text.split(/\r?\n/);
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (line !== "") {
            totalCount++;
            uniqueSet.add(line);
            
            const match = line.match(countryRegex);
            if (match) {
              countriesSet.add(match[1].toUpperCase());
            } else {
              countriesSet.add("UNKNOWN");
            }
          }
          
          if (i % 10000 === 0) {
            await new Promise(resolve => setTimeout(resolve, 0));
          }
        }
      }
      
      setTotalLines(totalCount);
      setUniqueLines(Array.from(uniqueSet));
      setDetectedCountries(Array.from(countriesSet).sort());
      setHasProcessed(true);
    } catch (error) {
      console.error("Error processing files:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const applyFilter = () => {
    const val = parseInt(mailFilter);
    setActiveFilter(isNaN(val) ? null : val);
    setActiveCountryFilter(selectedCountries);
    setActiveDateFilter(dateFilter);
  };

  const filteredLines = useMemo(() => {
    const countryRegex = /Country\s*=\s*([A-Za-z]{2})/i;
    const dateRegex = /Date\s*=\s*([0-9-T:.Z]+)/i;
    const agora = new Date();

    return uniqueLines.filter(line => {
      // 1. Country Filter
      if (activeCountryFilter.length > 0) {
        const match = line.match(countryRegex);
        const country = match ? match[1].toUpperCase() : "UNKNOWN";
        if (!activeCountryFilter.includes(country)) return false;
      }

      // 2. Mail Filter
      const mailMatch = line.match(/Mails\s*=\s*(\d+)/i);
      const hasMailsField = mailMatch !== null;
      
      if (onlyWithMails && !hasMailsField) return false;
      
      if (activeFilter !== null && hasMailsField) {
        const mails = parseInt(mailMatch[1]);
        if (mails < activeFilter) return false;
      }
      
      // 3. Last 3 Months filter
      return passesLast3MonthsFilter(line, activeDateFilter);
    });
  }, [uniqueLines, activeFilter, onlyWithMails, activeCountryFilter, activeDateFilter]);

  const toggleCountry = (country: string) => {
    setSelectedCountries(prev => 
      prev.includes(country) 
        ? prev.filter(c => c !== country) 
        : [...prev, country]
    );
  };

  const downloadTxt = () => {
    if (filteredLines.length === 0) return;
    
    const content = filteredLines.join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `filtered_database_${new Date().getTime()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const duplicatesRemoved = totalLines - uniqueLines.length;

  return (
    <div className="min-h-screen p-6 md:p-12 max-w-6xl mx-auto flex flex-col gap-8">
      {/* Header */}
      <header className="flex items-center gap-4 border-b border-primary/30 pb-6">
        <div className="bg-primary/10 p-3 rounded-lg border border-primary/50">
          <Database className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold tracking-wider text-primary drop-shadow-[0_0_8px_rgba(0,255,136,0.5)]">
            SYS::DATABASE_LINE_FILTER
          </h1>
          <p className="text-muted-foreground font-mono mt-1 text-sm">
            [ SECURE DATA DUPLICATION REMOVAL UTILITY v1.2.1 ]
          </p>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
        {/* Left Column - Input & Controls */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="w-full grid grid-cols-2 bg-card/50 border border-primary/20 mb-4 p-1">
              <TabsTrigger value="upload" className="font-display text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Upload className="w-3 h-3 mr-2" /> UPLOAD
              </TabsTrigger>
              <TabsTrigger value="filters" className="font-display text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Filter className="w-3 h-3 mr-2" /> FILTROS
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload">
              <Card className="border-primary/20 bg-card/50 backdrop-blur">
                <CardContent className="p-6">
                  <div 
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-4 min-h-[200px]
                      ${isDragging 
                        ? 'border-primary bg-primary/10 shadow-[0_0_15px_rgba(0,255,136,0.2)]' 
                        : 'border-muted-foreground/30 hover:border-primary/50 hover:bg-card/80'}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => !isProcessing && fileInputRef.current?.click()}
                    data-testid="upload-area"
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      multiple 
                      accept=".txt" 
                      className="hidden" 
                      onChange={handleFileSelect}
                      disabled={isProcessing}
                    />
                    
                    <div className="bg-background/80 p-4 rounded-full border border-primary/20">
                      <FileText className="w-8 h-8 text-primary/70" />
                    </div>
                    
                    <div>
                      <p className="font-mono font-bold text-foreground">DRAG & DROP .TXT FILES HERE</p>
                      <p className="text-sm text-muted-foreground mt-2">or click to browse local filesystem</p>
                    </div>
                  </div>

                  <AnimatePresence>
                    {files.length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-6"
                      >
                        <div className="flex justify-between items-end mb-2">
                          <h3 className="font-mono text-sm text-muted-foreground">QUEUED FILES ({files.length}):</h3>
                          <Button variant="ghost" size="sm" onClick={clearAll} disabled={isProcessing} className="text-xs h-6 px-2 text-destructive hover:text-destructive hover:bg-destructive/10">
                            <Trash2 className="w-3 h-3 mr-1" /> CLEAR ALL
                          </Button>
                        </div>
                        <ScrollArea className="h-32 border border-primary/10 rounded-md bg-background/50">
                          <div className="p-2 flex flex-col gap-1">
                            {files.map((file, idx) => (
                              <div key={`${file.name}-${idx}`} className="flex justify-between items-center text-sm font-mono p-2 hover:bg-primary/5 rounded group border border-transparent hover:border-primary/20">
                                <div className="truncate flex-1 pr-4 text-foreground/80">{file.name}</div>
                                <div className="text-muted-foreground text-xs shrink-0 mr-3">{(file.size / 1024).toFixed(1)} KB</div>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                                  disabled={isProcessing}
                                  className="text-muted-foreground hover:text-destructive opacity-50 group-hover:opacity-100 transition-opacity"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>

                        <Button 
                          className="w-full mt-4 font-display tracking-widest text-lg h-14 relative overflow-hidden group shadow-[0_0_15px_rgba(0,255,136,0.3)] hover:shadow-[0_0_25px_rgba(0,255,136,0.5)] transition-all"
                          onClick={processFiles}
                          disabled={isProcessing}
                          data-testid="button-process"
                        >
                          {isProcessing ? (
                            <>
                              <div className="absolute inset-0 bg-primary/20 animate-pulse"></div>
                              <Zap className="w-5 h-5 mr-2 animate-bounce text-primary-foreground" />
                              PROCESSING...
                            </>
                          ) : (
                            <>
                              <Zap className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                              EXECUTE FILTER
                            </>
                          )}
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="filters">
              <Card className="border-primary/20 bg-card/50 backdrop-blur">
                <CardContent className="p-6">
                  <h2 className="font-display text-xl mb-6 text-primary flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    ADVANCED_FILTERS
                  </h2>
                  
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-mono text-muted-foreground">
                        FILTRAR PAÍS ESCOLHIDO:
                      </Label>
                      <ScrollArea className="h-40 border border-primary/20 rounded-md bg-background/50 p-3">
                        <div className="grid grid-cols-2 gap-2">
                          {["US", "BR", "AU", "UK", "CA", "FR", "DE", "ES", "IT"].map(country => (
                            <div key={country} className="flex items-center space-x-2">
                              <Checkbox 
                                id={`country-${country}`}
                                checked={selectedCountries.includes(country)}
                                onCheckedChange={() => toggleCountry(country)}
                              />
                              <Label htmlFor={`country-${country}`} className="text-xs font-mono cursor-pointer">{country}</Label>
                            </div>
                          ))}
                          {detectedCountries.filter(c => !["US", "BR", "AU", "UK", "CA", "FR", "DE", "ES", "IT"].includes(c)).map(country => (
                            <div key={country} className="flex items-center space-x-2">
                              <Checkbox 
                                id={`country-${country}`}
                                checked={selectedCountries.includes(country)}
                                onCheckedChange={() => toggleCountry(country)}
                              />
                              <Label htmlFor={`country-${country}`} className="text-xs font-mono cursor-pointer">{country}</Label>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="date-filter" className="text-xs font-mono text-muted-foreground">
                        ÚLTIMAS MENSAGENS:
                      </Label>
                      <select
                        id="date-filter"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="w-full bg-background/50 border border-primary/20 rounded-md p-2 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="none">Sem filtro</option>
                        <option value="90">Últimos 3 meses</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="mail-filter" className="text-xs font-mono text-muted-foreground">
                        QUANTIDADE DE MENSAGEM MAIOR OU IGUAL A:
                      </Label>
                      <Input 
                        id="mail-filter"
                        type="number"
                        min="0"
                        placeholder="Ex: 100"
                        value={mailFilter}
                        onChange={(e) => setMailFilter(e.target.value)}
                        className="bg-background/50 border-primary/20 focus-visible:ring-primary font-mono"
                      />
                    </div>

                    <div className="flex items-center space-x-2 bg-primary/5 p-3 rounded-md border border-primary/10">
                      <Checkbox 
                        id="only-mails" 
                        checked={onlyWithMails}
                        onCheckedChange={(checked) => setOnlyWithMails(checked as boolean)}
                        className="border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                      />
                      <Label 
                        htmlFor="only-mails" 
                        className="text-xs font-mono text-primary cursor-pointer select-none"
                      >
                        MOSTRAR APENAS LINHAS QUE POSSUEM CAMPO MAILS
                      </Label>
                    </div>
                    
                    <Button 
                      onClick={applyFilter}
                      className="w-full font-display tracking-wider border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                      variant="outline"
                      data-testid="button-apply-filter"
                    >
                      APLICAR FILTRO
                    </Button>
                    
                    { (activeFilter !== null || onlyWithMails || activeCountryFilter.length > 0 || activeDateFilter !== "none") && (
                      <div className="p-3 bg-primary/5 border border-primary/20 rounded-md text-[10px] font-mono text-primary animate-in fade-in slide-in-from-top-2 flex flex-col gap-1">
                        <div className="font-bold border-b border-primary/20 pb-1 mb-1">FILTROS ATIVOS:</div>
                        {activeCountryFilter.length > 0 && <div>• PAÍSES: {activeCountryFilter.join(", ")}</div>}
                        {activeFilter !== null && <div>• MAILS ≥ {activeFilter}</div>}
                        {activeDateFilter !== "none" && <div>• DATA: Últimos 3 meses</div>}
                        {onlyWithMails && <div>• APENAS COM CAMPO MAILS</div>}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Results */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-primary/10 bg-card/30">
              <CardContent className="p-3 flex flex-col items-center justify-center text-center">
                <span className="text-muted-foreground font-mono text-[10px] mb-1">TOTAL LINES</span>
                <span className="font-display text-lg text-foreground" data-testid="stat-total">{totalLines.toLocaleString()}</span>
              </CardContent>
            </Card>
            <Card className="border-destructive/20 bg-destructive/5">
              <CardContent className="p-3 flex flex-col items-center justify-center text-center">
                <span className="text-destructive/70 font-mono text-[10px] mb-1">DUPLICATES</span>
                <span className="font-display text-lg text-destructive" data-testid="stat-removed">{duplicatesRemoved.toLocaleString()}</span>
              </CardContent>
            </Card>
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-3 flex flex-col items-center justify-center text-center">
                <span className="text-primary/70 font-mono text-[10px] mb-1">AFTER FILTERS</span>
                <span className="font-display text-lg text-primary" data-testid="stat-filtered">{filteredLines.length.toLocaleString()}</span>
              </CardContent>
            </Card>
            <Card className="border-primary/40 bg-primary/10 shadow-[0_0_10px_rgba(0,255,136,0.1)]">
              <CardContent className="p-3 flex flex-col items-center justify-center text-center">
                <span className="text-primary font-mono text-[10px] mb-1">FINAL DISPLAYED</span>
                <span className="font-display text-lg text-primary" data-testid="stat-final">{filteredLines.length.toLocaleString()}</span>
              </CardContent>
            </Card>
          </div>

          <Card className="border-primary/20 bg-card/50 flex-1 flex flex-col">
            <CardContent className="p-6 flex-1 flex flex-col h-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-display text-xl text-primary flex items-center gap-2">
                  <Layout className="w-5 h-5" />
                  OUTPUT_STREAM
                </h2>
                
                {hasProcessed && filteredLines.length > 0 && (
                  <Button 
                    variant="outline" 
                    className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-mono text-xs transition-all shadow-[0_0_10px_rgba(0,255,136,0.2)]"
                    onClick={downloadTxt}
                    data-testid="button-download"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    BAIXAR TXT FILTRADO
                  </Button>
                )}
              </div>

              <div className="flex-1 bg-background rounded-md border border-primary/20 min-h-[400px] relative overflow-hidden font-mono text-sm">
                {!hasProcessed ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground/50">
                    <Database className="w-12 h-12 mb-4 opacity-20" />
                    <p className="tracking-widest">AWAITING INPUT...</p>
                  </div>
                ) : (
                  <ScrollArea className="h-full absolute inset-0">
                    <div className="p-4">
                      {filteredLines.slice(0, 1000).map((line, i) => (
                        <div key={i} className="py-1 border-b border-primary/5 hover:bg-primary/5 text-foreground/80 break-all whitespace-pre font-mono">
                          <span className="text-primary/40 mr-4 select-none inline-block w-12 text-right text-xs">{i + 1}</span>
                          {line}
                        </div>
                      ))}
                      {filteredLines.length > 1000 && (
                        <div className="py-4 text-center text-primary/60 italic border-t border-primary/20 mt-2 bg-primary/5">
                          ... and {(filteredLines.length - 1000).toLocaleString()} more lines omitted from preview ...
                        </div>
                      )}
                      {filteredLines.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                          <Filter className="w-8 h-8 mb-2 opacity-20" />
                          <p>NO LINES MATCHING THE CURRENT FILTERS</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                )}
                
                <div className="absolute top-0 right-0 w-2 h-2 bg-primary/50"></div>
                <div className="absolute bottom-0 left-0 w-2 h-2 bg-primary/50"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { 
  Printer, FileText, Download, ChevronDown, ChevronRight, 
  Bold, Italic, Underline, Type, Trash2, Plus, Upload, Save, Clock, Shuffle, ListOrdered,
  AlertCircle, CheckCircle, X, Cloud
} from 'lucide-react';

// --- CUSTOM HOOKS ---
function useStickyState(defaultValue, key) {
  const [value, setValue] = useState(() => {
    const stickyValue = window.localStorage.getItem(key);
    return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
  });
  
  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  
  return [value, setValue];
}

// --- TOAST NOTIFICATION COMPONENT ---
const Toast = ({ message, type, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const enterTimer = setTimeout(() => setIsVisible(true), 10);
        const exitTimer = setTimeout(() => setIsVisible(false), 3000);
        const cleanupTimer = setTimeout(() => onClose(), 3500);

        return () => {
            clearTimeout(enterTimer);
            clearTimeout(exitTimer);
            clearTimeout(cleanupTimer);
        };
    }, [onClose]);

    const baseClasses = "fixed bottom-6 left-1/2 transform -translate-x-1/2 px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 transition-all duration-500 z-50 border";
    const typeClasses = type === 'error' 
        ? "bg-red-50 border-red-200 text-red-800" 
        : "bg-green-50 border-green-200 text-green-800";
    
    const animationClasses = isVisible 
        ? "translate-y-0 opacity-100" 
        : "translate-y-32 opacity-0";

    return (
        <div className={`${baseClasses} ${typeClasses} ${animationClasses}`}>
            {type === 'error' ? <AlertCircle className="text-red-600" size={24} /> : <CheckCircle className="text-green-600" size={24} />}
            <div className="flex flex-col">
                <span className="font-bold text-sm">{type === 'error' ? 'Error' : 'Success'}</span>
                <span className="text-sm opacity-90">{message}</span>
            </div>
            <button onClick={() => setIsVisible(false)} className="ml-4 p-1 rounded-full hover:bg-black/5 transition">
                <X size={16} />
            </button>
        </div>
    );
};

// --- RICH TEXT EDITOR COMPONENT ---
const RichTextEditor = ({ initialValue, onChange, label }) => {
  const contentRef = useRef(null);
  const colorInputRef = useRef(null);

  const format = (command, value = null) => {
    document.execCommand(command, false, value);
    if (contentRef.current) contentRef.current.focus();
  };

  const handleInput = () => {
      if (onChange && contentRef.current) {
          onChange(contentRef.current.innerHTML);
      }
  };

  const triggerColorPicker = () => {
    colorInputRef.current.click();
  };

  const handleColorChange = (e) => {
    format('foreColor', e.target.value);
  };

  return (
    <div className="border border-gray-300 rounded overflow-hidden bg-white mb-3">
        {label && <div className="bg-gray-100 px-2 py-1 text-xs text-gray-500 font-medium border-b border-gray-200">{label}</div>}
        
        <div className="flex flex-wrap items-center gap-1 p-1 bg-gray-50 border-b border-gray-200">
            <button onClick={() => format('bold')} className="p-1 hover:bg-gray-200 rounded" title="Bold"><Bold size={14} /></button>
            <button onClick={() => format('italic')} className="p-1 hover:bg-gray-200 rounded" title="Italic"><Italic size={14} /></button>
            <button onClick={() => format('underline')} className="p-1 hover:bg-gray-200 rounded" title="Underline"><Underline size={14} /></button>
            
            <div className="w-px h-4 bg-gray-300 mx-1"></div>
            
            <select 
                onChange={(e) => format('fontName', e.target.value)} 
                className="text-xs border border-gray-300 rounded px-1 py-0.5 focus:outline-none focus:border-blue-500"
                defaultValue="Arial"
            >
                <option value="Arial">Arial</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Courier New">Courier</option>
                <option value="Georgia">Georgia</option>
                <option value="Verdana">Verdana</option>
            </select>

            <select 
                onChange={(e) => format('fontSize', e.target.value)} 
                className="text-xs border border-gray-300 rounded px-1 py-0.5 w-16 focus:outline-none focus:border-blue-500"
                defaultValue="3"
            >
                <option value="1">Tiny</option>
                <option value="2">Small</option>
                <option value="3">Normal</option>
                <option value="4">Medium</option>
                <option value="5">Large</option>
                <option value="6">X-Large</option>
                <option value="7">Huge</option>
            </select>

            <div className="w-px h-4 bg-gray-300 mx-1"></div>

            <div className="relative flex items-center">
                <button 
                    onClick={triggerColorPicker}
                    className="p-1 hover:bg-gray-200 rounded flex items-center gap-1"
                    title="Text Color"
                >
                    <div className="w-4 h-4 rounded-sm bg-gradient-to-br from-red-500 via-green-500 to-blue-500 border border-gray-300"></div>
                </button>
                <input 
                    ref={colorInputRef}
                    type="color" 
                    onChange={handleColorChange}
                    className="absolute opacity-0 w-0 h-0"
                />
            </div>

            <button onClick={() => format('removeFormat')} className="p-1 hover:bg-gray-200 rounded ml-auto" title="Clear Formatting"><Type size={14} /></button>
        </div>

        <div 
            ref={contentRef}
            contentEditable
            className="p-3 min-h-[80px] text-sm focus:outline-none focus:bg-blue-50/10"
            dangerouslySetInnerHTML={{ __html: initialValue }}
            onInput={handleInput}
            onBlur={handleInput}
            style={{ fontFamily: 'Arial, sans-serif' }}
        />
    </div>
  );
};

// --- ANIMATED ACCORDION COMPONENT ---
const Accordion = ({ title, children, defaultOpen = false, onDelete, extraAction }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden mb-3 bg-white shadow-sm">
            <div 
                className="flex items-center justify-between p-3 bg-gray-50 cursor-pointer select-none hover:bg-gray-100 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-2 font-medium text-gray-700 text-sm">
                     {/* Rotate Chevron based on state */}
                    <div className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                         <ChevronDown size={16} />
                    </div>
                    {title}
                </div>
                <div className="flex items-center gap-2">
                    {extraAction}
                    {onDelete && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); onDelete(); }}
                            className="text-gray-400 hover:text-red-500 p-1"
                        >
                            <Trash2 size={14} />
                        </button>
                    )}
                </div>
            </div>
            
            {/* CSS Grid Animation Trick */}
            <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-70'}`}>
                <div className="overflow-hidden">
                    <div className="p-4 border-t border-gray-200">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- CONTENT DISPLAY COMPONENT ---
const EmailContent = ({ config, approvers, recipientOrder, calculateTimestamp, cumulativeDelayRef }) => {
  cumulativeDelayRef.current = 0;

  const getSortedRecipients = () => {
      const approverMap = new Map(approvers.map(a => [a.id, a]));
      // We start with the recipientOrder (which is randomized visually)
      const ordered = recipientOrder
          .map(id => approverMap.get(id))
          .filter(Boolean);
      // Add anyone missing from the order to the end
      const missing = approvers.filter(a => !recipientOrder.includes(a.id));
      return [...ordered, ...missing];
  };

  const recipientsList = getSortedRecipients();

  return (
    <div className="email-content-body">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
           <div><img src="https://ci3.googleusercontent.com/meips/ADKq_NYCMT22cTcb7KDAVm7PAucDbB8WNy86rtsG8HqXFGLitRnJUa1NdOLBG1JY8WYvuAxVeRHcnkx4ny67uudD71w4BNoYP_0f94RM42mX0A=s0-d-e1-ft" alt="SBU Shield" style={{height: '55px', width: 'auto'}} /></div>
           <div style={{fontSize: '12px', fontWeight: 'bold', color: '#555', whiteSpace: 'nowrap', textAlign: 'right'}}>
                {config.senderName} {'<'}{config.senderEmail}{'>'}
           </div>
      </div>
      <hr style={{margin: '0 0 5px 0', borderTop: '1px solid #ccc'}} />
      <div style={{padding: '0'}}>
          <div className="subject" style={{marginBottom: '2px', fontSize: '18px', fontWeight: 'bold'}}>
              [Item/Expense] {config.eventName} {config.amount ? `$${config.amount}` : ''}
          </div>
          <div style={{fontSize: '13px', color: '#555'}}>{approvers.length + 2} messages</div>
      </div>
      <hr style={{margin: '5px 0 10px 0', borderTop: '1px solid #ccc'}} />

      {/* MESSAGE 1: REQUEST */}
      <table width="100%" cellPadding="0" cellSpacing="0" border="0" className="message" style={{marginBottom: '5px'}}>
          <tbody>
              <tr>
                  <td><font size="-1"><b>{config.senderName}</b> <span className="meta-text">{'<'}{config.senderEmail}{'>'}</span></font></td>
                  <td align="right"><font size="-1" className="meta-text">{calculateTimestamp(config.date, config.timeStart, 0)}</font></td>
              </tr>
              <tr>
                  <td colSpan="2" style={{paddingBottom: '5px'}}>
                      <font size="-1" className="recipient-block">
                          {/* Randomly ordered recipients in To line */}
                          <div>To: {recipientsList.length > 0 ? recipientsList.map(a => `${a.name} <${a.email}>`).join(', ') + ',' : ''} {config.clubName} {'<'}{config.ccEmail}{'>'}</div>
                      </font>
                  </td>
              </tr>
              <tr>
                  <td colSpan="2">
                      <div style={{marginTop: '5px', marginLeft: '10px'}}>
                          Hello {recipientsList.map(a => a.name).join(', ')}, and {config.senderName}
                          <br/><br/>
                          I am writing to formally request approval of <b>{config.amount ? `$${config.amount}` : ''}</b> from "<b>{config.vendor}</b>" using our USG Budget.
                          <br/><br/>
                          This request is for items listed in this spreadsheet:<br/>
                          <a href={config.invoiceLink} target="_blank" rel="noreferrer">Invoice</a>
                          <br/><br/>
                          Please "reply all" to this email saying "I approve" to confirm the funding request.
                          <br/><br/>
                          <span style={{backgroundColor: 'yellow', textDecoration: 'underline', fontWeight: 'bold', fontStyle: 'italic'}}>
                          In the replies please include your name and position! Everyone must approve this request including the sender by replying to the email using their own personal SBU email
                          </span>
                          <br/><br/>
                          <div dangerouslySetInnerHTML={{ __html: config.senderSignature }} />
                      </div>
                  </td>
              </tr>
          </tbody>
      </table>

      {/* MESSAGE 2: SENDER APPROVAL (MOVED TO FIRST POSITION) */}
      {(() => {
        cumulativeDelayRef.current += config.finalApprovalDelay; // Add sender's delay first
        return (
          <>
            <hr style={{margin: '10px 0', borderTop: '1px solid #ccc'}} />
            <table width="100%" cellPadding="0" cellSpacing="0" border="0" className="message">
                <tbody>
                    <tr>
                        <td><font size="-1"><b>{config.senderName}</b> <span className="meta-text">{'<'}{config.senderEmail}{'>'}</span></font></td>
                        <td align="right"><font size="-1" className="meta-text">{calculateTimestamp(config.date, config.timeStart, cumulativeDelayRef.current)}</font></td>
                    </tr>
                    <tr>
                        <td colSpan="2" style={{paddingBottom: '5px'}}>
                            <font size="-1" className="recipient-block">
                                <div>To: {approvers.map(a => `${a.name} <${a.email}>`).join(', ')}</div>
                                <div>Cc: {config.clubName} {'<'}{config.ccEmail}{'>'}</div>
                            </font>
                        </td>
                    </tr>
                    <tr>
                        <td colSpan="2">
                            <div style={{marginTop: '5px', marginLeft: '10px'}}>
                                I approve,
                                <br/>
                                {config.senderName} ({config.senderTitle})
                                <br/><br/>
                                <div style={{color: '#888', fontSize: '11px'}}>[Quoted text hidden]</div>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
          </>
        );
      })()}

      {/* APPROVAL LOOPS - OTHER APPROVERS FOLLOW SENDER */}
      {approvers.map((approver) => {
        cumulativeDelayRef.current += approver.delayMin; // Add to time AFTER sender has approved
        return (
          <React.Fragment key={approver.id}>
              <hr style={{margin: '10px 0', borderTop: '1px solid #ccc'}} />
              <table width="100%" cellPadding="0" cellSpacing="0" border="0" className="message" style={{marginBottom: '5px'}}>
                  <tbody>
                      <tr>
                          <td><font size="-1"><b>{approver.name}</b> <span className="meta-text">{'<'}{approver.email}{'>'}</span></font></td>
                          <td align="right"><font size="-1" className="meta-text">{calculateTimestamp(config.date, config.timeStart, cumulativeDelayRef.current)}</font></td>
                      </tr>
                      <tr>
                          <td colSpan="2" style={{paddingBottom: '5px'}}>
                              <font size="-1" className="recipient-block">
                                  <div>To: {config.senderName} {'<'}{config.senderEmail}{'>'}</div>
                                  <div>Cc: {approvers.filter(a => a.id !== approver.id).map(a => `${a.name} <${a.email}>`).join(', ')}, {config.clubName} {'<'}{config.ccEmail}{'>'}</div>
                              </font>
                          </td>
                      </tr>
                      <tr>
                          <td colSpan="2">
                              <div style={{marginTop: '5px', marginLeft: '10px'}}>
                                  I approve,
                                  <br/>
                                  {approver.name} {approver.role ? `(${approver.role})` : ''}
                                  <br/><br/>
                                  <div style={{color: '#888', fontSize: '11px'}}>[Quoted text hidden]</div>
                                  {approver.customSignature && (
                                      <div style={{marginTop: '15px', color: '#222', fontSize: '12.5px', lineHeight: '1.5'}}>
                                          <div dangerouslySetInnerHTML={{ __html: approver.customSignature }} />
                                      </div>
                                  )}
                              </div>
                          </td>
                      </tr>
                  </tbody>
              </table>
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default function App() {
  const getCurrentTimeInput = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
  };

  const getRandomDelay = () => {
    const r = Math.random();
    if (r < 0.3) return Math.floor(Math.random() * 13) + 2;
    if (r < 0.7) return Math.floor(Math.random() * 45) + 15;
    return Math.floor(Math.random() * 120) + 60;
  };

  const fileInputRef = useRef(null);
  const [toast, setToast] = useState(null);

  // --- CONFIG (EMPTY WITH GHOST TEXT VIA PLACEHOLDERS) ---
  const [config, setConfig] = useStickyState({
    eventName: "",
    amount: "",
    vendor: "",
    invoiceLink: "",
    date: new Date().toISOString().split('T')[0],
    timeStart: getCurrentTimeInput(),
    senderName: "",
    senderEmail: "",
    senderTitle: "",
    clubName: "",
    ccEmail: "",
    finalApprovalDelay: 5, // Default low for sender
    senderSignature: ""
  }, 'budget-gen-config-v8'); 

  // --- DEFAULT APPROVERS (3 EMPTY SLOTS) ---
  const [approvers, setApprovers] = useStickyState([
    { id: 1, name: "", email: "", role: "", delayMin: 15, customSignature: "" },
    { id: 2, name: "", email: "", role: "", delayMin: 45, customSignature: "" },
    { id: 3, name: "", email: "", role: "", delayMin: 20, customSignature: "" }
  ], 'budget-gen-approvers-v8');

  const [recipientOrder, setRecipientOrder] = useStickyState([1, 2, 3], 'budget-gen-recipient-order-v8');

  useEffect(() => {
      setRecipientOrder(prevOrder => {
          const currentIds = approvers.map(a => a.id);
          const newOrder = prevOrder.filter(id => currentIds.includes(id));
          const missingIds = currentIds.filter(id => !newOrder.includes(id));
          return [...newOrder, ...missingIds];
      });
  }, [approvers.length, approvers.map(a => a.id).join(',')]); 

  const [footerIds] = useState(() => {
    const randomNum = (len) => Array.from({length: len}, () => Math.floor(Math.random() * 10)).join('');
    const randomHex = (len) => Array.from({length: len}, () => Math.floor(Math.random() * 16).toString(16)).join('');
    return { ik: randomHex(10), thread: randomNum(19), msg: randomNum(18) };
  });

  const contentMeasureRef = useRef(null);
  const [totalHeight, setTotalHeight] = useState(0);
  const cumulativeDelayRef = useRef(0);
  const CONTENT_AREA_HEIGHT = 900; 
  
  useLayoutEffect(() => {
    if (contentMeasureRef.current) {
        setTotalHeight(contentMeasureRef.current.scrollHeight);
    }
  }, [config, approvers, recipientOrder]);

  const totalPages = Math.max(1, Math.ceil(totalHeight / CONTENT_AREA_HEIGHT));

  const getPrintTime = () => {
    try {
        if (!config.date || !config.timeStart) return "";
        const [year, month, day] = config.date.split('-').map(Number);
        const [hour, minute] = config.timeStart.split(':').map(Number);
        const dateObj = new Date(year, month - 1, day, hour, minute);

        let totalMinutes = 0;
        approvers.forEach(a => totalMinutes += a.delayMin);
        totalMinutes += config.finalApprovalDelay;
        totalMinutes += 18; 

        dateObj.setMinutes(dateObj.getMinutes() + totalMinutes);
        return `${dateObj.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' })}, ${dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
    } catch (e) { return ""; }
  };

  const printTimeStr = getPrintTime();
  const pageTitle = `Stony Brook University Mail - [Item/Expense] ${config.eventName} ${config.amount ? `$${config.amount}` : ''}`;
  const footerUrl = `https://mail.google.com/mail/u/0/?ik=${footerIds.ik}&view=pt&search=all&permthid=thread-a:r${footerIds.thread}&simpl=msg-a:r-${footerIds.msg}`;

  const calculateTimestamp = (baseDateStr, baseTimeStr, minutesToAdd = 0) => {
    try {
        if (!baseDateStr || !baseTimeStr) return "Invalid";
        const [year, month, day] = baseDateStr.split('-').map(Number);
        const [hour, minute] = baseTimeStr.split(':').map(Number);
        const dateObj = new Date(year, month - 1, day, hour, minute);
        dateObj.setMinutes(dateObj.getMinutes() + minutesToAdd);
        return `${dateObj.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })} at ${dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
    } catch (e) { return "Error"; }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: value }));
  };

  const handleApproverChange = (id, field, value) => {
      setApprovers(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const addApprover = () => {
      const newId = Math.max(...approvers.map(a => a.id), 0) + 1;
      setApprovers([...approvers, { id: newId, name: "", email: "", role: "", delayMin: 15, customSignature: "" }]);
  };

  const removeApprover = (id) => {
      setApprovers(prev => prev.filter(a => a.id !== id));
  };

  const randomizeTimes = (e) => {
    if(e) e.stopPropagation();
    setApprovers(prev => prev.map(a => ({ ...a, delayMin: getRandomDelay() })));
    // Sender (finalApprovalDelay) gets a shorter delay because they are now first
    setConfig(prev => ({ ...prev, finalApprovalDelay: Math.floor(Math.random() * 8) + 2 }));
  };

  const shuffleResponseOrder = (e) => {
    if(e) e.stopPropagation();
    setApprovers(prev => {
        const shuffled = [...prev];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    });
  };

  const shuffleRecipientOrder = (e) => {
    if(e) e.stopPropagation();
    setRecipientOrder(prev => {
        const shuffled = [...prev];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    });
  };

  const handleExport = () => {
    // Strip date/time before exporting
    const { date, timeStart, ...configToExport } = config;
    const data = { config: configToExport, approvers, recipientOrder };
    
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `budget_data_${config.eventName ? config.eventName.replace(/\s+/g, '_') : 'template'}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        
        if (!data || typeof data !== 'object') throw new Error("File content is not valid JSON object");
        if (!data.config) throw new Error("Missing 'config' section");
        if (!Array.isArray(data.approvers)) throw new Error("Missing 'approvers' list");

        // Merge imported config
        const importedConfig = {
            ...data.config,
            date: new Date().toISOString().split('T')[0],
            timeStart: getCurrentTimeInput(),
            // Sender gets short delay as they are first
            finalApprovalDelay: Math.floor(Math.random() * 8) + 2 
        };

        // Randomize Approvers Delays
        const randomizedApprovers = data.approvers.map(a => ({
            ...a,
            delayMin: getRandomDelay()
        }));

        // Shuffle Response Order
        for (let i = randomizedApprovers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [randomizedApprovers[i], randomizedApprovers[j]] = [randomizedApprovers[j], randomizedApprovers[i]];
        }

        // Shuffle Recipient Order (Completely Random)
        let newRecipientOrder;
        if (data.recipientOrder) {
             newRecipientOrder = [...data.recipientOrder];
        } else {
             newRecipientOrder = randomizedApprovers.map(a => a.id);
        }

        for (let i = newRecipientOrder.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newRecipientOrder[i], newRecipientOrder[j]] = [newRecipientOrder[j], newRecipientOrder[i]];
        }

        setConfig(importedConfig);
        setApprovers(randomizedApprovers);
        setRecipientOrder(newRecipientOrder);
        
        setToast({ message: "Configuration loaded. Sender is first!", type: "success" });

      } catch (error) {
        setToast({ message: `Import Failed: ${error.message}`, type: "error" });
      }
      e.target.value = null; 
    };
    reader.readAsText(file);
  };

  const handlePrint = () => window.print();

  const handleDownload = () => {
    const printContent = document.getElementById('print-view-container').innerHTML;
    const styles = `
      <style>
        body { margin: 0; padding: 0; background: white; font-family: Arial, Helvetica, sans-serif; -webkit-print-color-adjust: exact; }
        .print-page { position: relative; width: 8.5in; height: 11in; page-break-after: always; break-after: page; overflow: hidden; background: white; }
        .content-mask { position: absolute; top: 45px; left: 45px; right: 45px; height: ${CONTENT_AREA_HEIGHT}px; overflow: hidden; background: white; }
        .content-stream { position: absolute; left: 0; right: 0; }
        .gmail-view { font-size: 13px; color: #222; line-height: 1.4; }
        .gmail-view a { color: #1155cc; text-decoration: none; }
        .gmail-view hr { border: 0; border-top: 1px solid #ccc; height: 0; margin: 0; display: block; }
        .meta-text, .recipient-block { font-size: 12px !important; color: #555; }
        .spoof-header { position: absolute; top: 12px; left: 15px; right: 15px; display: flex; align-items: center; justify-content: center; font-family: sans-serif; font-size: 10px; color: #555; }
        .spoof-header .header-left { position: absolute; left: 0; }
        .spoof-footer { position: absolute; bottom: 12px; left: 15px; right: 15px; display: flex; justify-content: space-between; align-items: center; font-family: sans-serif; font-size: 10px; color: #555; }
        .spoof-footer .footer-url { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-right: 20px; }
      </style>
    `;
    const html = `<!DOCTYPE html><html><head><title>${pageTitle}</title>${styles}</head><body>${printContent}<script>window.onload = function() { setTimeout(function(){ window.print(); }, 500); }</script></body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${config.eventName ? config.eventName.replace(/\s+/g, '_') : 'request'}_Request.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // Roles for placeholders (Treasurer removed)
  const placeholderRoles = ['Secretary', 'Vice President', 'President'];

  return (
    <div className="flex h-screen bg-gray-100 font-sans overflow-hidden main-container">
        {/* TOAST MOUNT POINT */}
        {toast && (
            <Toast 
                message={toast.message} 
                type={toast.type} 
                onClose={() => setToast(null)} 
            />
        )}
        
        <style>{`
            body { overflow: hidden; }
            .gmail-view { font-family: Arial, Helvetica, sans-serif; font-size: 13px; color: #222; line-height: 1.4; }
            .gmail-view a { color: #1155cc; text-decoration: none; }
            .gmail-view a:hover { text-decoration: underline; }
            .gmail-view hr { border: 0; border-top: 1px solid #ccc; height: 0; margin: 0; }
            .meta-text { font-size: 12px !important; color: #555; }
            .recipient-block { color: #555; font-size: 12px !important; }
            ::-webkit-scrollbar { width: 8px; }
            ::-webkit-scrollbar-track { background: #f1f1f1; }
            ::-webkit-scrollbar-thumb { background: #ccc; border-radius: 4px; }
            
            /* CLOUD SPOOFER TEXT STYLE */
            .cloud-spoofer {
                color: white;
                font-weight: 900;
                letter-spacing: 1px;
                -webkit-text-stroke: 1.5px #38bdf8;
                text-shadow: 2px 2px 0px #bae6fd, 4px 4px 0px rgba(0,0,0,0.05);
                font-family: 'Verdana', sans-serif;
            }

            #measurement-container { 
                position: fixed; top: -9999px; left: -9999px; visibility: hidden; 
                z-index: -1; width: 850px; height: auto; pointer-events: none;
            }
            #screen-view-container { display: block; }
            #print-view-container { display: none; }
            @media print {
                @page { margin: 0; size: portrait; }
                body, html { height: 100%; margin: 0; background: white; -webkit-print-color-adjust: exact; overflow: visible; }
                .main-container { display: block !important; height: auto !important; overflow: visible !important; }
                .no-print { display: none !important; }
                #screen-view-container { display: none !important; }
                #print-view-container { display: block !important; }
            }
            .print-page { position: relative; width: 100%; height: 11in; page-break-after: always; break-after: page; overflow: hidden; background: white; }
            .content-mask { position: absolute; top: 45px; left: 45px; right: 45px; height: ${CONTENT_AREA_HEIGHT}px; overflow: hidden; background: white; }
            .content-stream { position: absolute; left: 0; right: 0; }
            .spoof-header { position: absolute; top: 12px; left: 15px; right: 15px; display: flex; align-items: center; justify-content: center; font-family: sans-serif; font-size: 10px; color: #666; }
            .spoof-header .header-left { position: absolute; left: 0; }
            .spoof-footer { position: absolute; bottom: 12px; left: 15px; right: 15px; display: flex; justify-content: space-between; align-items: center; font-family: sans-serif; font-size: 10px; color: #555; }
            .spoof-footer .footer-url { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-right: 20px; }
        `}</style>

        {/* LEFT PANEL: CONFIGURATION */}
        <div className="w-1/3 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto no-print shadow-xl z-10 flex flex-col gap-4">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <FileText className="text-blue-500" />
                        <span>Approval <span className="cloud-spoofer text-lg">Spoofer</span></span>
                    </h2>
                    <p className="text-xs text-gray-500">Settings auto-save locally.</p>
                </div>
                {/* IMPORT/EXPORT BUTTONS */}
                <div className="flex gap-1">
                    <button onClick={handleExport} className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-100 rounded transition" title="Save to JSON">
                        <Save size={18} />
                    </button>
                    <label className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-100 rounded transition cursor-pointer" title="Load from JSON">
                        <Upload size={18} />
                        <input type="file" ref={fileInputRef} accept=".json" className="hidden" onChange={handleImport} />
                    </label>
                </div>
            </div>
            
            <div className="space-y-2">
                {/* EVENT DETAILS ACCORDION */}
                <Accordion title="Event & Invoice Details" defaultOpen={true}>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Event Name</label>
                            <input type="text" name="eventName" value={config.eventName} onChange={handleChange}
                                placeholder="e.g. Annual Spring Banquet"
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm outline-none focus:border-blue-500" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                             <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Amount ($)</label>
                                <input type="text" name="amount" value={config.amount} onChange={handleChange}
                                    placeholder="e.g. 150.00"
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm outline-none focus:border-blue-500" />
                            </div>
                            <div>
                                 <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
                                 <input type="date" name="date" value={config.date} onChange={handleChange}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm outline-none focus:border-blue-500" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Start Time</label>
                             <div className="flex gap-2">
                                <input type="time" name="timeStart" value={config.timeStart} onChange={handleChange}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm outline-none focus:border-blue-500" />
                             </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Vendor</label>
                            <input type="text" name="vendor" value={config.vendor} onChange={handleChange}
                                placeholder="e.g. Local Catering Co."
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm outline-none focus:border-blue-500" />
                        </div>
                         <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Invoice URL</label>
                            <input type="text" name="invoiceLink" value={config.invoiceLink} onChange={handleChange}
                                placeholder="https://docs.google.com/spreadsheets/d/1BxiMvs0XRA5nFK..."
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm outline-none focus:border-blue-500 text-blue-600" />
                        </div>
                    </div>
                </Accordion>

                {/* SENDER ACCORDION */}
                <Accordion title="Sender (Requester)">
                     <div className="space-y-3">
                         <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
                                <input type="text" name="senderName" value={config.senderName} onChange={handleChange}
                                     placeholder="e.g. John Doe"
                                     className="w-full px-2 py-1 border border-gray-300 rounded text-sm outline-none focus:border-blue-500" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Title</label>
                                <input type="text" name="senderTitle" value={config.senderTitle} onChange={handleChange}
                                     placeholder="e.g. Club Treasurer"
                                     className="w-full px-2 py-1 border border-gray-300 rounded text-sm outline-none focus:border-blue-500" />
                            </div>
                         </div>
                         <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                             <input type="text" name="senderEmail" value={config.senderEmail} onChange={handleChange}
                                     placeholder="e.g. john.doe@university.edu"
                                     className="w-full px-2 py-1 border border-gray-300 rounded text-sm outline-none focus:border-blue-500" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Sender Delay (min)</label>
                            <input type="number" name="finalApprovalDelay" value={config.finalApprovalDelay} onChange={handleChange}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm outline-none focus:border-blue-500" />
                        </div>
                        {/* Nested Accordion for Signature */}
                        <Accordion title="Edit Signature" defaultOpen={false}>
                            <RichTextEditor 
                                initialValue={config.senderSignature} 
                                onChange={(html) => setConfig(prev => ({...prev, senderSignature: html}))} 
                            />
                        </Accordion>
                    </div>
                </Accordion>
                
                {/* NEW ACCORDION: ORGANIZATION INFO */}
                <Accordion title="Organization / CC">
                     <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Club/Org Name</label>
                            <input type="text" name="clubName" value={config.clubName} onChange={handleChange}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm outline-none focus:border-blue-500" 
                                placeholder="e.g. Student Government"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">CC Email</label>
                             <input type="text" name="ccEmail" value={config.ccEmail} onChange={handleChange}
                                     placeholder="e.g. budget.committee@university.edu"
                                     className="w-full px-2 py-1 border border-gray-300 rounded text-sm outline-none focus:border-blue-500" />
                        </div>
                    </div>
                </Accordion>

                <div className="border-t border-gray-200 my-2 pt-2">
                    <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Approvers Chain</label>
                        <div className="flex gap-2">
                            <button 
                                onClick={shuffleRecipientOrder} 
                                className="text-xs flex items-center gap-1 bg-gray-200 hover:bg-gray-300 text-gray-600 px-2 py-1 rounded transition"
                                title="Shuffle the visual order in the recipients list"
                            >
                                <ListOrdered size={12} /> CC List
                            </button>
                            <button 
                                onClick={shuffleResponseOrder} 
                                className="text-xs flex items-center gap-1 bg-gray-200 hover:bg-gray-300 text-gray-600 px-2 py-1 rounded transition"
                                title="Randomly reorder who replies when"
                            >
                                <Shuffle size={12} /> Order
                            </button>
                            <button 
                                onClick={randomizeTimes} 
                                className="text-xs flex items-center gap-1 bg-gray-200 hover:bg-gray-300 text-gray-600 px-2 py-1 rounded transition"
                                title="Randomize all delays"
                            >
                                <Clock size={12} /> Delays
                            </button>
                        </div>
                    </div>
                    
                    {approvers.map((approver, index) => (
                        <Accordion 
                            key={approver.id} 
                            title={`${index + 1}. ${approver.name || 'New Approver'}`} 
                            onDelete={() => removeApprover(approver.id)}
                        >
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
                                        <input type="text" value={approver.name} onChange={(e) => handleApproverChange(approver.id, 'name', e.target.value)}
                                            placeholder="e.g. Jane Smith"
                                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm outline-none focus:border-blue-500" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Delay (min)</label>
                                        <input type="number" value={approver.delayMin} onChange={(e) => handleApproverChange(approver.id, 'delayMin', parseInt(e.target.value) || 0)}
                                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm outline-none focus:border-blue-500" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                                    <input type="text" value={approver.email} onChange={(e) => handleApproverChange(approver.id, 'email', e.target.value)}
                                        placeholder="e.g. jane.smith@university.edu"
                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm outline-none focus:border-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Role (Optional)</label>
                                    <input type="text" value={approver.role} onChange={(e) => handleApproverChange(approver.id, 'role', e.target.value)}
                                        placeholder={`e.g. ${placeholderRoles[index % placeholderRoles.length]}`}
                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm outline-none focus:border-blue-500" />
                                </div>
                                {/* Nested Accordion for Signature */}
                                <Accordion title="Edit Signature" defaultOpen={false}>
                                    <RichTextEditor 
                                        initialValue={approver.customSignature} 
                                        onChange={(html) => handleApproverChange(approver.id, 'customSignature', html)} 
                                    />
                                </Accordion>
                            </div>
                        </Accordion>
                    ))}
                    <button onClick={addApprover} className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-500 transition flex items-center justify-center gap-2 text-sm font-medium mt-2">
                        <Plus size={16} /> Add Approver
                    </button>
                </div>
                
                <div className="flex gap-2 mt-4">
                    <button onClick={handleDownload} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-2 rounded-lg flex items-center justify-center gap-2 transition shadow-md text-sm">
                        <Download size={18} /> HTML
                    </button>
                    <button onClick={handlePrint} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-2 rounded-lg flex items-center justify-center gap-2 transition shadow-md text-sm">
                        <Printer size={18} /> Print
                    </button>
                </div>
            </div>
        </div>

        {/* MEASUREMENT CONTAINER */}
        <div id="measurement-container" className="gmail-view" ref={contentMeasureRef}>
            <EmailContent config={config} approvers={approvers} recipientOrder={recipientOrder} calculateTimestamp={calculateTimestamp} cumulativeDelayRef={cumulativeDelayRef} />
        </div>

        {/* RIGHT PANEL: PREVIEW */}
        <div className="w-2/3 bg-gray-500 overflow-y-auto p-8 flex justify-center preview-container">
            {/* SCREEN VIEW */}
            <div id="screen-view-container" className="gmail-view bg-white shadow-2xl w-full max-w-[850px] p-10 h-fit min-h-[11in] relative flex flex-col">
                 <EmailContent config={config} approvers={approvers} recipientOrder={recipientOrder} calculateTimestamp={calculateTimestamp} cumulativeDelayRef={cumulativeDelayRef} />
            </div>

            {/* PRINT VIEW */}
            <div id="print-view-container">
                {Array.from({ length: totalPages }).map((_, pageIndex) => (
                    <div key={pageIndex} className="print-page gmail-view">
                        <div className="spoof-header">
                            <div className="header-left">{printTimeStr}</div>
                            <div className="header-center">{pageTitle}</div>
                            <div className="header-right"></div>
                        </div>
                        <div className="content-mask">
                            <div className="content-stream" style={{ top: `-${pageIndex * CONTENT_AREA_HEIGHT}px` }}>
                                <EmailContent config={config} approvers={approvers} recipientOrder={recipientOrder} calculateTimestamp={calculateTimestamp} cumulativeDelayRef={cumulativeDelayRef} />
                            </div>
                        </div>
                        <div className="spoof-footer">
                            <div className="footer-url">{footerUrl}</div>
                            <div className="footer-page">{pageIndex + 1}/{totalPages}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
}